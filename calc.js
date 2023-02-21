function calculate(formula_str) {
    console.log( formula_str );
    for (const match of formula_str.matchAll(/\((.*)\)/g)) {
        console.log(match[1]);
    }
}
calculate('a + c * (e + f) + (g + h) + d + b');
