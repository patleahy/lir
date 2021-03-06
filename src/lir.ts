export const Lir = () => new LirMapping();

class LirMapping {
    private rules: LirTo[] = [];

    public from(path: string): LirFrom {
        return new LirFrom(this, path);
    }

    public map(source: any): any {
        var output = {};
        for (var i = 0; i < this.rules.length; i++) {
            this.rules[i].map(source, output);
        }
        return output;
    }

    public add(rule: LirTo) {
        this.rules.push(rule);
    }
}

class LirFrom {
    private path: string;
    private mapping: LirMapping;

    public constructor(mapping: LirMapping, path: string) {
        this.mapping = mapping;
        this.path = path;
    }

    public to(path: string): LirTo {
        var to = new LirTo(this.path, path);
        this.mapping.add(to);
        return to;
    }
}

class LirTo {
    private pathFrom: string[];
    private pathTo: string[];

    public constructor(pathFrom: string, pathTo: string) {
        this.pathFrom = (pathFrom || "").length > 0 ? pathFrom.split('.') : [];
        this.pathTo = (pathTo || "").length > 0 ? pathTo.split('.') : [];
    }

    /** @internal */
    public map(source: any, output: any): any {
        var values = this.walk(source, this.pathFrom);
        this.apply(this.pathTo, values, output);
        return output;
    }

    private walk(obj: any, path: string[]): any {
        var value = obj[path[0]];
        if (path.length == 1) {
            return value;
        }
        
        var innerPath = path.slice(1);

        if (Array.isArray(value)) {
            return value.map(v => this.walk(v, innerPath));
        }

        return this.walk(value, innerPath);
    }

    private apply(path: string[], value: any, obj: any) {
        var key = path[0];
        var isArray = key.endsWith('[]');
        if (isArray) { key = key.slice(0, key.length-2); }

        if (path.length == 1) {
            obj[key] = value;
        } else {
            var property = obj[key];
            if (property === undefined) {
                obj[key] = property = isArray ? [] : {};
            }

            var innerPath = path.slice(1);
            if (isArray) {
                value.forEach(item => {
                    var newObj = {};
                    this.apply(innerPath, item, newObj);
                    property.push(newObj);
                });
            } else {
                this.apply(innerPath, value, property);
            }
        }
    }
}