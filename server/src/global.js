let global = Function("return this")() || (42, eval)("this"); // jshint ignore:line
export { global };
