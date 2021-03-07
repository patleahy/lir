export const Lir = () => new LirRoot();

class LirRule {
    protected children: LirRule[] = [];
    protected fromPath: string[];
    protected toPath: string[];

    public constructor(fromPath: string, toPath: string) {
        this.fromPath = LirRule.split(fromPath);
        this.toPath = LirRule.split(toPath);
    }

    public map(input: any, output?: any): any {
        if (output === undefined) 
            output = {};

        var inputValue = this.walk(input, this.fromPath);
        var outputValue = this.mapChildren(inputValue);
        return this.apply(output, outputValue, this.toPath);
    }

    public with(path: string) : LirWithFrom {
        return new LirWithFrom(this, path);
    }

    public add(rule: LirRule) {
        this.children.push(rule);
    }

    protected walk(input: any, path: string[]): any {
        if (path.length === 0)
            return input;

        return this.walk(input[path[0]], path.slice(1));
    }

    protected mapChildren(inputValue): any {
        var outputValue = {};
        if (this.children.length) {
            this.children.forEach(rule => {
                rule.map(inputValue, outputValue);
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
        return rule;
    }

    public each(): LirEachFrom {
        return new LirEachFrom(this.parent, this.path); 
    }
}

class LirWithFrom extends LirFrom {
    public to(path: string) : LirWithRule {
        var rule = new LirWithRule(this.parent, this.path, path);
        this.parent.add(rule);
        return rule;
    }
}

class LirWithRule extends LirRule {
    private parent: LirRule;
    
    public constructor(parent: LirRule, fromPath: string, toPath: string) {
        super(fromPath, toPath);
        this.parent = parent;
    }

    public and(path: string): LirWithFrom {
        return new LirWithFrom(this.parent, path);
    }
}

class LirEachFrom extends LirFrom {
    
    public to(path: string) : LirRule {
        var rule = new LirEachRule(this.path, path);
        this.parent.add(rule);
        return rule;
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

class LirRoot extends LirRule {
    
    public constructor() {
        super('', '');
    }

    public from(path: string) : LirFrom {
        return new LirFrom(this, path);
    }
}