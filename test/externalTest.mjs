import { NameMC } from "../src/NameMC.mjs";
import { WrapperError } from "../src/WrapperError.mjs";

import { tests } from "./tests.mjs";

tests(new NameMC(), WrapperError, "ESM");
