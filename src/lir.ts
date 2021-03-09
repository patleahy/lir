/**
 * Lir - pat@patleahy.com - Implementation of the Lir DSL.
 */

/**
 * There are two ways you can use the DSL. You can create a root rule and then
 * chain rules onto it, e.g.:
 * 
 *      import { Lir } from './lir';
 *
 *      Lir().from('from.prop').to('to.prop').map(source);
 *
 * Alternatively you can import the 'from' function and use it to create a root
 * rule:
 *
 *      import { from } from './lir';
 * 
 *      from('from.prop').to('to.prop').map(source);
 */
export const Lir = () => new LirRootRule();
export const from = (path: string) => Lir().from(path);

/**
 * A Lir rule.
 *
 * Rules copy a property from an input object to an output object. The source
 * of the property in the input object is specified using the fromPath. The
 * destination of the property in the output object is specified using the
 * toPath.
 *
 * The transform function is used to modify the property after it is read from
 * the input object. This is set when the the 'using' keyword is used. Overwise
 * this is set to an identity function.
 *
 * If the rule has children the map() is called on each child in order. The
 * output object is passed to map(). This allows the child rules set properties
 * on the output. Rules could be nested an arbitrary number of levels deep.
 */
class LirRule {
    protected children: LirRule[] = [];
    protected fromPath: string[];
    protected toPath: string[];
    protected transform: (x: any) => any;

    public constructor(fromPath: string, toPath: string, transform?: (x: any)=> any) {
        this.fromPath = LirRule.split(fromPath);
        this.toPath = LirRule.split(toPath);
        this.transform = transform || (x => x);
    }

    /**
     * Return an object which only has the methods which can be called after
     * from() in the method chain.
     */
    public from(path: string) : LirFrom {
        return new LirFrom(this, path);
    }

    /**
     * Map the input object to the output. Input will be set to the correct
     * scope by the calling function. That function may be the program these
     * rules are embedded in or a parent rule.
     *
     * If this is called by the program which these rules are embedded in, then
     * output won't be specified. If this is called by a parent rule then
     * output will be null for the first child and will be set to the result of
     * the previous children's map() functions for subsequent children.
     */
    public map(input: any, output?: any): any {
        if (output === undefined)
            output = {};

        // Walk down into the input object to the object which has the property
        // we are working on. If the fromPath doesn't exist in the input then
        // return, this allows us to ignore missing properties.
        var innerObject = this.walk(input, this.fromPath, false);
        if (innerObject === undefined)
            return output;

        // Read the property from the input object and transform.
        var inputValue = innerObject[this.fromPath[this.fromPath.length-1]];
        inputValue = this.transform(inputValue);

        // Use the children's mapping functions to read from the input property
        // and set the output property.
        var outputValue = this.mapChildren(inputValue);

        // Now we have an output object for this level of scope with all the
        // input properties set. Apply this object to the parent object.
        return this.apply(output, outputValue, this.toPath, false);
    }

    /**
     * A new tree of rules will be passed into with() to specify rules at
     * this level of scope. The rules should be added to the last
     * child of this rule because visually that is how it appears in the code.
     * E.g.
     *
     *  1    var output =
     *  2        from('rss.channel').to('feed')
     *  3         .with(
     *  4            from('title').to('title.text')
     *  5            .from('link.href').to('link.href'));
     *
     * After line 2 is run there are two rules in the rules tree, i.e. a root
     * rule which contains the rule we can see at line 2. The to() method on
     * line 2 returns the root rule. This is so that if the next methods in the
     * chain were another from().to() then the new rule would also be added to
     * the root. A result of to() returning the root is that when the with()
     * method is called it is called on the root rule. We want the with() method
     * to add its children (lines 4 and 5) to the rule from line 2. To do this
     * with() appends the new rules to the children of the last child inside the
     * root. The result looks like this:
     *
     *      RootRule
     *         - children
     *             - Rule: from('rss.channel').to('feed')
     *                 - children
     *                     - Rule: from('title').to('title.text')
     *                     - Rule: from('link.href').to('link.href')
     *
     */
    public with(rule: LirRule) : LirRule {
        if (rule instanceof LirRootRule) {
            for (var i = 0; i < rule.children.length; i++) {
                this.with(rule.children[i]);
            }
        } else {
            this.children[this.children.length-1].add(rule);
        }
        return this;
    }

    /**
     * Add a special rule to the children rules which will add insert properties
     * from an object literal to the output object when mapping.
     */
    public include(value: any): LirRule {
        var rule = new LirIncludeRule(value);
        this.children.push(rule);
        return this;
    }

    /**
     * Add a child rule. Used by parents to push rules down to children.
     * See with().
     */
    public add(rule: LirRule) {
        this.children.push(rule);
    }

    /**
     * Given a path to a property, walk down into the input object to find the
     * object which the property would appear on.
     * i.e. given the path [ 'rss', 'channel', 'title' ]
     * then walk() would return the channel object because that is the object
     * which contains the title property.
     * If create is true then this method will create any objects in the path
     * which don't exist until it can return the specified object. This is used
     * when applying rules.
     * If create is false then this method returns undefined if it can't walk
     * all the way to the required object. This allows us to ignore missing
     * properties.
     */
    protected walk(input: any, path: string[], create: boolean): any {
        if (path.length === 1)
            return input;

        var key = path[0];
        var inner = input[key];
        if (inner === undefined) {
            if (create) {
                input[key] = inner = {};
            } else {
                return undefined;
            }
        }

        return this.walk(inner, path.slice(1), create);
    }

    /**
     * Create a new output given an input object and the child rules in the
     * current rule. The first child rule will output properties on a new
     * object. Subsequent child rules will update that object with additional
     * properties. When finished these will return the output object.
     *
     * The map() method which called this method will then set the correct
     * property in the parent's output object with the return from this method.
     * When rules are nested then there could be recursive calls to this method.
     * i.e.
     *      map() -> mapChildren() -> map() -> mapChildren() ...
     */
    protected mapChildren(inputValue: any): any {
        var outputValue = {};
        if (this.children.length) {
            this.children.forEach(rule => {
                outputValue = rule.map(inputValue, outputValue);
            });
        } else {
            outputValue = inputValue;
        }
        return outputValue;
    }

    /**
     * Given an output object and an output value, set the property specified
     * by path in output to contain the value.
     * There is special handling if the output should be an array.
     */
    protected apply(object: any, value: any, path: string[], isArray: boolean): any {

        // Find the object at the correct scope to update.
        // This will create intermediate objects if necessary.
        var innerObject = this.walk(object, path, true);
        var key = path[path.length-1];
        var property = innerObject[key];

        if (property === undefined) {
            // If the property being set doesn't exist on the object simply
            // set it to the value to the property.
            innerObject[key] = value;
        } else {
            // The property already exists so we need to merge the value into
            // the existing object
            if (isArray) {
                // For each item in the array if an item with the same index
                // exists in the existing property then merge them,
                // otherwise append the item to the end of the array.
                for (var i = 0; i < value.length; i++) {
                    var item = property[i];
                    if (item === undefined) {
                        property.push(value[i]);
                    } else {
                        property[i] = {...item, ...value[i]};
                    }
                }
            } else {
                // This is not an array so merge the existing property and new
                // value.
                innerObject[key] = {...property, ...value};
            }
        }

        return object;
    }

    private static split(path: string): string[] {
        if (!path)
            return [];
        return path.split('.');
    }
}

/**
 * Type used to identify roots of rule trees.
 */
class LirRootRule extends LirRule {

    constructor() {
        super('', '');
    }

    public map(input: any): any {
        return this.mapChildren(input);
    }
}

/**
 * Returned from LirRule.from().
 * This provides the methods which can be chained after from(),
 * e.g. These are allowed:
 *
 *      from().to()
 *      from().each()
 *      etc
 *
 * The compiler and IDE wouldn't allow these:
 *
 *      from().from()
 *      from().map()
 */
class LirFrom {
    protected parent: LirRule;
    protected path: string;

    public constructor(parent: LirRule, path: string) {
        this.parent = parent;
        this.path = path;
    }

    public to(path: string) : LirRule {
        var rule = new LirRule(this.path, path);
        this.parent.add(rule);
        return this.parent;
    }

    public each(): LirEachFrom {
        return new LirEachFrom(this.parent, this.path);
    }

    public using(fn: (x: any) => any) {
        return new LirUsingFrom(this.parent, this.path, fn);
    }
}

/**
 * A special case of LirFrom so that we can implement using()
 * when it is used after each().
 */
class LirEachFrom extends LirFrom {

    public to(path: string) : LirRule {
        var rule = new LirEachRule(this.path, path);
        this.parent.add(rule);
        return this.parent;
    }

    public using(fn: (x: any) => any) {
        return new LirUsingEachFrom(this.parent, this.path, fn);
    }
}

/**
 * This is the rule created by the each() method.
 * The rule does what LirRule.map() does on each item in the input array.
 */
class LirEachRule extends LirRule {

    public map(input: any, output?: any): any {
        if (output === undefined)
            output = {};

        var inputValues = this.walk(input, this.fromPath, false)[this.fromPath[this.fromPath.length-1]];
        var outputValues = [];
        for (var i = 0; i < inputValues.length; i++) {
            outputValues.push(this.mapChildren(this.transform(inputValues[i])));
        }
        return this.apply(output, outputValues, this.toPath, true);
    }
}

/**
 * Implementation of the include() method. This merges the output object with
 * an object literal.
 */
class LirIncludeRule extends LirRule {
    private value: any;

    constructor(value: any) {
        super(null, null);
        this.value = value;
    }

    public map(_: any, output?: any): any {
        if (output === undefined)
            output = {};

        return { ...output, ...this.value };
    }
}

/**
 * A special case of LirFrom so that we can remember the transform function
 * specified.
 */
class LirUsingFrom extends LirFrom {
    protected transform: (x: any) => any;

    constructor(parent: LirRule, path: string, transform: (x: any) => any) {
        super(parent, path);
        this.transform = transform;
    }

    public to(path: string) : LirRule {
        var rule = new LirRule(this.path, path, this.transform);
        this.parent.add(rule);
        return this.parent;
    }
}

/**
  *A special case of LirUsingFrom so that we can remember the transform function
 * specified when this construct is used:
 *
 *      from().each().using().to()
 */
class LirUsingEachFrom extends LirUsingFrom {

    public to(path: string) : LirEachRule {
        var rule = new LirEachRule(this.path, path, this.transform);
        this.parent.add(rule);
        return this.parent;
    }
}