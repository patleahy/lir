export const Lir = () => new LirRoot();

class LirRule {
    private children: LirRule[] = [];
    private fromPath: string[];
    private toPath: string[];

    public constructor(fromPath: string, toPath: string) {
        this.fromPath = LirRule.split(fromPath);
        this.toPath = LirRule.split(toPath);
    }

    public map(input: any, output?: any): any {
        if (output === undefined) 
            output = {};

        var inputValue = this.walk(input, this.fromPath);
        var outputValue;
        if (this.children.length) {
            outputValue = {};
            this.children.forEach(rule => {
                rule.map(inputValue, outputValue);
            });
        } else {
            outputValue = inputValue;
        }

        return this.apply(output, outputValue, this.toPath);
    }

    public with(path: string) : LirWith {
        return new LirWith(this, path);
    }

    public add(rule: LirRule) {
        this.children.push(rule);
    }

    private walk(input: any, path: string[]): any {
        if (path.length === 0)
            return input;

        return this.walk(input[path[0]], path.slice(1));
    }

    private apply(object: any, value: any, path: string[]): any {
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
}

class LirWith extends LirFrom {
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

    public and(path: string): LirWith {
        return new LirWith(this.parent, path);
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