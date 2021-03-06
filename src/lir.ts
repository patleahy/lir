export class Lir {

    public static from(path: string): LirFrom {
        return new LirFrom(path);
    }
}

class LirFrom {
    private path: string;

    public constructor(path: string) {
        this.path = path;
    }

    public to(path: string): LirTo {
        return new LirTo(this.path, path);
    }
}

class LirTo {
    private pathFrom: string[];
    private pathTo: string[];

    public constructor(pathFrom: string, pathTo: string) {
        this.pathFrom = (pathFrom || "").length > 0 ? pathFrom.split('.') : [];
        this.pathTo = (pathTo || "").length > 0 ? pathTo.split('.') : [];
    }

    public map(source: any): any {

        var values = this.walk(source, this.pathFrom);
        var output = {};
        this.construct(output, this.pathTo, values);
        return output;
    }

    private walk(obj: any, path: string[]): any {
        var value = obj[path[0]];
        if (path.length == 1) {
            return value;
        }
        
        var innerPath = path.slice(1);

        if (Array.isArray(value)) {
            var values = [];

            for (var i = 0; i < value.length; i++) {
                values.push(this.walk(value[i], innerPath));
            }
            return values;
        }

        return this.walk(value, innerPath);
    }

    private construct(obj: any, path: string[], value: any) {
        var property = path[0];
        var isArray = property.endsWith('[]');
        if (isArray) {
            property = property.slice(0, property.length-2);
        }

        if (path.length == 1) {
            obj[property] = value;
        } else {
            var innerPath = path.slice(1);
            if (isArray) {
                var newArray = [];
                for (var i = 0; i < value.length; i++) {
                    var newObject = {};
                    this.construct(newObject, innerPath, value[i]);
                    newArray.push(newObject);
                }
                obj[property] = newArray;
            } else {
                var newObj = {};
                obj[property] = newObj;
                this.construct(newObj, innerPath, value);
            }
        }
    }
}