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

        var sourceProperty: any = source;
        for (var i = 0; i < this.pathFrom.length; i++) {
            sourceProperty = sourceProperty[this.pathFrom[i]];
        }
        
        var output: any = {};
        var outputProperty: any = output;
        for(var i = 0; i < this.pathTo.length - 1; i++) {
            var newProperty: any = {};
            outputProperty[this.pathTo[i]] = newProperty;
            outputProperty = newProperty;
        }
        outputProperty[this.pathTo[this.pathTo.length-1]] = sourceProperty;

        return output;
    }
}