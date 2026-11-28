'use strict';

(() => {

  const B = window.STEMPhysicsBank;

  const sci = (a, n) =>
    `${B.fmt(a)} × 10^(${n})`;

  B.register('Notación científica', () => {

    const a = B.rand(11, 99) / 10;
    const b = B.rand(2, 9);
    const n = B.pick([-6,-5,-4,-3,-2,2,3,4,5,6]);
    const m = B.rand(1, 4);

    const mode = B.rand(0, 4);

    if (mode === 0) {

      const value = B.fmt(a * 10 ** n);
      const r = sci(a, n);

      return B.item(
        `Exprese ${value} en notación científica.`,
        r,
        `${value} = ${r}`,
        [
          sci(a, n + 1),
          sci(a, n - 1),
          sci(a, -n)
        ]
      );
    }

    if (mode === 1) {

      const r = B.fmt(a * 10 ** n);

      return B.item(
        `Exprese ${sci(a,n)} en notación decimal.`,
        r,
        `${sci(a,n)} = ${r}`,
        [
          B.fmt(a * 10 ** (n + 1)),
          B.fmt(a * 10 ** (n - 1)),
          B.fmt(a * 10 ** (-n))
        ]
      );
    }

    if (mode === 2) {

      const product = a * b;
      const shift = product >= 10 ? 1 : 0;
      const c = product / 10 ** shift;
      const e = n + m + shift;
      const r = sci(c, e);

      return B.item(
        `Calcule (${sci(a,n)}) × (${sci(b,m)}). Exprese el resultado en notación científica.`,
        r,
        `${B.fmt(a)} × ${b} × 10^(${n+m}) = ${r}`,
        [
          sci(c, e + 1),
          sci(c, e - 1),
          sci(c, e + 2)
        ]
      );
    }

    if (mode === 3) {

      const quotient = a / b;
      const shift = quotient < 1 ? -1 : 0;
      const c = Number((quotient / 10 ** shift).toPrecision(3));
      const correction = c >= 10 ? 1 : 0;
      const coefficient = c / 10 ** correction;
      const e = n - m + shift + correction;
      const r = sci(coefficient, e);

      return B.item(
        `Calcule (${sci(a,n)}) ÷ (${sci(b,m)}). Redondee a tres cifras significativas.`,
        r,
        `Se dividen los coeficientes y se restan los exponentes. Resultado: ${r}`,
        [
          sci(coefficient, e + 1),
          sci(coefficient, e - 1),
          sci(coefficient, e + 2)
        ]
      );
    }

    const r = String(n);

    return B.item(
      `Determine el exponente de la potencia de diez en la expresión ${sci(a,n)}.`,
      r,
      `El exponente es ${n}.`,
      [n + 1, n - 1, -n]
    );

  });

})();
