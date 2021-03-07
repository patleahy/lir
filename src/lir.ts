export const Lir = () => new LirRootRule();
export const from = (path: string) => Lir().from(path);


class LirRule {
    protected children: LirRule[] = [];
    protected fromPath: string[];
    protected toPath: string[];

    public constructor(fromPath: string, toPath: string) {
        this.fromPath = LirRule.split(fromPath);
        this.toPath = LirRule.split(toPath);
    }

    public from(path: string) : LirFrom {
        return new LirFrom(this, path);
    }

    public map(input: any, output?: any): any {
        if (output === undefined) 
            output = {};

        var inputValue = this.walk(input, this.fromPath);
        var outputValue = this.mapChildren(inputValue);
        return this.apply(output, outputValue, this.toPath);
    }

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

    public include(value: any): LirRule {
        var rule = new LirIncludeRule(value);
        this.children.push(rule);
        return this;
    }

    public add(rule: LirRule) {
        this.children.push(rule);
    }

    protected walk(input: any, path: string[]): any {
        if (path.length === 0)
            return input;

        return this.walk(input[path[0]], path.slice(1));
    }

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

    protected apply(object: any, value: any, path: string[]): any {
        if (path.length == 0) {
            object = value;
        } else {
            var key = path[0];
            if (path.length === 1) {
                object[key] = value;
            } else {
                var property = object[key];
                if (property === undefined) {
                    object[key] = property = {};
                }
                this.apply(property, value, path.slice(1));
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


class LirRootRule extends LirRule {
    
    constructor() {
        super('', '');
    }
}


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


class LirEachFrom extends LirFrom {
    
    public to(path: string) : LirRule {
        var rule = new LirEachRule(this.path, path);
        this.parent.add(rule);
        return this.parent;
    }
}


class LirEachRule extends LirRule {

    public map(input: any, output?: any): any {
        if (output === undefined)
            output = {};

        var inputValues = this.walk(input, this.fromPath);
        var outputValues = [];
        for (var i = 0; i < inputValues.length; i++) {
            outputValues.push(this.mapChildren(inputValues[i]));
        }
        return this.apply(output, outputValues, this.toPath);
    }
}


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


class LirUsingFrom extends LirFrom {
    private fn: (x: any) => any;

    constructor(parent: LirRule, path: string, fn: (x: any) => any) {
        super(parent, path);
        this.fn = fn;
    }

    public to(path: string) : LirRule {
        var rule = new LirUsingRule(this.path, path, this.fn);
        this.parent.add(rule);
        return this.parent;
    }
}


class LirUsingRule extends LirRule {
    private fn: (x: any) => any;

    constructor(fromPath: string, toPath: string, fn: (x: any) => any) {
        super(fromPath, toPath);
        this.fn = fn;
    }

    public map(input: any, output?: any): any {
        if (output === undefined) 
            output = {};

        var inputValue = this.walk(input, this.fromPath);
        inputValue = this.fn(inputValue);
        var outputValue = this.mapChildren(inputValue);
        return this.apply(output, outputValue, this.toPath);
    }
}