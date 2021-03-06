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
});