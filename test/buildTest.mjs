import NameMCWrapper from "../dist/NameMC.js";
import NameMCWrapperError from "../dist/WrapperError.js";

import { tests } from "./tests.mjs";

const { NameMC } = NameMCWrapper;
const { WrapperError } = NameMCWrapperError;

tests(new NameMC(), WrapperError, "Babel CommonJS");
