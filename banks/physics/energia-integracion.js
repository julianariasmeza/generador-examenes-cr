'use strict';

(() => {

  const B = window.STEMPhysicsBank;

  const Figures = window.STEMEnergyFigures;

  const n = '([0-9]+(?:[,.][0-9]+)?)';

  function read(q,pattern) {

    const match = q.match(
      new RegExp(pattern,'i')
    );

    return match
      ? Number(match[1].replace(',','.'))
      : undefined;

  }

  function clean(data) {

    return Object.fromEntries(
      Object.entries(data).filter(
        ([key,value]) => value!==undefined
      )
    );

  }

  function wrap(topic,identify) {

    const original = B.generator(topic);

    if(typeof original !== 'function') {

      throw new Error(
        'Generador no encontrado: '+topic
      );

    }

    B.register(topic,() => {

      const z = original();

      const model = identify(z.q);

      if(!model) return z;

      return Figures.attach(
        z,
        model.type,
        clean(model.data)
      );

    });

  }

  function common(q) {

    return {

      m:read(q,n+' kg'),

      h:read(q,'altura de '+n+' m'),

      hf:read(q,'encuentra a '+n+' m sobre el suelo'),

      mu:read(q,'fricción cinética es '+n)
        ?? read(q,'fricción cinética '+n),

      k:read(q,n+' N/m'),

      v:read(q,'rapidez de '+n+' m/s')
        ?? read(q,'se mueve a '+n+' m/s'),

      x:read(q,'comprimido '+n+' m')
        ?? read(q,'comprime '+n+' m')
        ?? read(q,'compresión máxima de '+n+' m')
        ?? read(q,'deformado '+n+' m'),

      angle:read(q,n+'°'),

      L:read(q,n+' m de longitud'),

      t:read(q,'en '+n+' s'),

      d:read(q,'desplazamiento de '+n+' m')
        ?? read(q,'desplaza un objeto '+n+' m')
        ?? read(q,'se desplaza '+n+' m')
        ?? read(q,'primeros '+n+' m')
        ?? read(q,'recorrer '+n+' m')
        ?? read(q,'tramo horizontal rugoso de '+n+' m')

    };

  }

  // TRABAJO MECANICO

  wrap('Trabajo mecánico',q => {

    const d = common(q);

    if(/levanta verticalmente/i.test(q)) {

      return {
        type:'lift',
        data:{m:d.m,h:d.h}
      };

    }

    const force = read(q,n+' N\\b');

    return {

      type:'work',

      data:{

        F:force,

        showForce:true,

        d:d.d,

        angle:d.angle

      }

    };

  });

  // TRABAJO NETO Y ROZAMIENTO

  wrap('Trabajo neto y rozamiento',q => {

    const d = common(q);

    if(!/superficie horizontal/i.test(q)) {

      return null;

    }

    return {

      type:'work',

      data:{

        m:d.m,

        d:d.d,

        mu:d.mu,

        F:read(q,'fuerza horizontal de '+n+' N'),

        fk:read(
          q,
          'fricción tiene una magnitud constante de '+n+' N'
        )

      }

    };

  });

  // POTENCIA

  wrap('Potencia mecánica',q => {

    if(!/grúa eleva/i.test(q)) {

      return null;

    }

    const d = common(q);

    return {

      type:'lift',

      data:{

        m:d.m,

        h:d.h,

        t:d.t

      }

    };

  });

  // EFICIENCIA

  wrap('Eficiencia mecánica',q => {

    // No utilizar etiquetas en joules
    // para problemas de potencia.

    if(/potencia/i.test(q)) return null;

    return {

      type:'efficiency',

      data:{

        input:read(q,'recibe '+n+' J'),

        useful:read(q,'entrega '+n+' J'),

        eta:read(q,'eficiencia del '+n+' %')

      }

    };

  });

  // ENERGIA POTENCIAL ELASTICA

  wrap('Energía potencial elástica',q => {

    if(/relación Ee/i.test(q)) {

      return null;

    }

    const d = common(q);

    const cm = read(q,'estira '+n+' cm');

    return {

      type:'elastic',

      data:{

        k:d.k,

        x:d.x ?? (
          cm===undefined ? undefined : cm/100
        )

      }

    };

  });

  // CONSERVACION DE ENERGIA

  wrap('Conservación de la energía mecánica',q => {

    const d = common(q);

    if(/péndulo ideal/i.test(q)) {

      return {

        type:'pendulum',

        data:{m:d.m,h:d.h}

      };

    }

    if(/rampa sin rozamiento/i.test(q)) {

      return {

        type:'ramp',

        data:{

          m:d.m,

          h:d.h ?? read(
            q,
            'diferencia de altura entre los extremos de la rampa es '+n+' m'
          )

        }

      };

    }

    if(/se deja caer/i.test(q)) {

      return {

        type:'fall',

        data:{

          m:d.m,

          h:d.h,

          hf:d.hf

        }

      };

    }

    return null;

  });

  // ENERGIA CON ROZAMIENTO

  wrap('Energía mecánica con rozamiento',q => {

    const d = common(q);

    if(/plano inclinado/i.test(q)) {

      return {

        type:'ramp',

        data:{

          m:d.m,

          L:d.L,

          angle:d.angle,

          mu:d.mu

        }

      };

    }

    return {

      type:'work',

      data:{

        m:d.m,

        mu:d.mu,

        d:d.d

      }

    };

  });

  // SISTEMAS CON RESORTES

  wrap('Sistemas con resortes',q => {

    const d = common(q);

    if(/rampa sin rozamiento/i.test(q)) {

      // Se reservara un modelo especifico
      // de rampa y resorte sin friccion.

      return null;

    }

    return {

      type:'spring',

      data:{

        m:d.m,

        k:d.k,

        x:d.x,

        v:d.v,

        mu:d.mu

      }

    };

  });

  // SISTEMAS DE VARIAS ETAPAS

  wrap('Problemas de varias etapas',q => {

    const d = common(q);

    return {

      type:'stages',

      data:{

        m:d.m,

        h:d.h,

        mu:d.mu,

        d:d.d,

        k:d.k

      }

    };

  });

})();
