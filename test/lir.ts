import { expect } from "chai";
import { Lir } from "../src/lir";

describe("Lir", () => {

    it("single shallow property mapping", () => {
        var source = { name: "Andy" };
        
        var lir = Lir.from("name").to("title");
        var output = lir.map(source);

        expect(output.title).to.be.equal("Andy");
    });

    it("single deeper property mapping", () => {
        var source = {
            person: {
                name: {
                    first: "Andy",
                    last: "Palmer"
                }
            }
        };
        
        var lir = Lir.from("person.name.last").to('character.lastName');
        var output = lir.map(source);

        expect(output.character.lastName).to.be.equal("Palmer");
    });

    it("array of properties mapping", () => {
        var source = {
            people: [
                { name : { first: "Andy", last: "Palmer" } },
                { name : { first: "Dag", last: "Bellinghausen" } },
                { name : { first: "Claire", last: "Baxter" } },
            ]
        };

        var lir = Lir.from("people.name.first").to("character[].firstName");
        var output = lir.map(source);

        expect(output.character[0].firstName).to.be.equal("Andy");
        expect(output.character[1].firstName).to.be.equal("Dag");
        expect(output.character[2].firstName).to.be.equal("Claire");
    });
});