
const addN = (a: number) => (b: number) => a + b;

const addEight = addN(8);

document.writeln('const addEight = addN(8) //', typeof addN(8));
document.write('<br>');
document.writeln('addEight(7); //', addEight(7).toString());
document.write('<br>');
document.writeln('addEight(100); //', addEight(100).toString());