(function(){

  'use strict';

  const g = 9.8;

  function number(value,name){

    if(
      value===undefined ||
      value===null ||
      String(value).trim()===''
    ){
      throw new Error('Complete: '+name);
    }

    const n = Number(
      String(value).trim().replace(',','.')
    );

    if(!Number.isFinite(n)){
      throw new Error('Valor inválido: '+name);
    }

    return n;

  }

  function positive(value,name){

    const n = number(value,name);

    if(n<=0){
      throw new Error(name+' debe ser positivo.');
    }

    return n;

  }

  function nonnegative(value,name){

    const n = number(value,name);

    if(n<0){
      throw new Error(name+' no puede ser negativo.');
    }

    return n;

  }

  function calculate(type,data){

    const p = (key,name)=>
      positive(data[key],name);

    const n = (key,name)=>
      nonnegative(data[key],name);

    const a = (key,name)=>
      number(data[key],name);

    let result;

    switch(type){

      case 'work': {

        const F = n('F','Fuerza');
        const d = n('d','Desplazamiento');
        const angle = n('angle','Ángulo');

        if(angle>180){
          throw new Error(
            'El ángulo debe estar entre 0° y 180°.'
          );
        }

        const W = angle===90
          ? 0
          : F*d*Math.cos(angle*Math.PI/180);

        result = {F,d,angle,W};

        break;

      }

      case 'friction': {

        const mu = n('mu','Coeficiente de fricción');
        const m = p('m','Masa');
        const d = n('d','Desplazamiento');

        const N = m*g;
        const fk = mu*N;
        const Wf = -fk*d;

        result = {mu,m,d,N,fk,Wf};

        break;

      }

      case 'netWork': {

        const F = n('F','Fuerza aplicada');
        const m = p('m','Masa');
        const mu = n('mu','Coeficiente de fricción');
        const d = n('d','Desplazamiento');

        const N = m*g;
        const fk = mu*N;
        const Wa = F*d;
        const Wf = -fk*d;
        const W = Wa+Wf;

        result = {F,m,mu,d,N,fk,Wa,Wf,W};

        break;

      }

      case 'power': {

        const W = n('W','Trabajo');
        const t = p('t','Tiempo');

        result = {W,t,P:W/t};

        break;

      }

      case 'efficiency': {

        const input = p('input','Energía suministrada');
        const useful = n('useful','Energía útil');

        if(useful>input){
          throw new Error(
            'La energía útil no puede superar la suministrada.'
          );
        }

        result = {

          input,

          useful,

          loss:input-useful,

          eta:100*useful/input

        };

        break;

      }

      case 'kinetic': {

        const m = p('m','Masa');
        const v = n('v','Rapidez');

        result = {m,v,Ec:m*v*v/2};

        break;

      }

      case 'potential': {

        const m = p('m','Masa');
        const h = a('h','Altura');

        result = {m,h,Ep:m*g*h};

        break;

      }

      case 'elastic': {

        const k = p('k','Constante elástica');
        const x = n('x','Deformación');

        result = {k,x,Ee:k*x*x/2};

        break;

      }

      case 'workEnergy': {

        const m = p('m','Masa');
        const vi = n('vi','Rapidez inicial');
        const vf = n('vf','Rapidez final');

        const Eci = m*vi*vi/2;
        const Ecf = m*vf*vf/2;

        result = {

          m,vi,vf,Eci,Ecf,

          W:Ecf-Eci

        };

        break;

      }

      case 'conservation': {

        const m = p('m','Masa');
        const hi = a('hi','Altura inicial');
        const hf = a('hf','Altura final');
        const vi = n('vi','Rapidez inicial');

        const Em = m*g*hi+m*vi*vi/2;

        const Epf = m*g*hf;

        const Ecf = Em-Epf;

        if(Ecf<0){
          throw new Error(
            'La altura final no es alcanzable.'
          );
        }

        const vf = Math.sqrt(2*Ecf/m);

        result = {m,hi,hf,vi,Em,Epf,Ecf,vf};

        break;

      }

      case 'roughSurface': {

        const m = p('m','Masa');
        const vi = n('vi','Rapidez inicial');
        const mu = p('mu','Coeficiente de fricción');
        const d = n('d','Distancia');

        const Eci = m*vi*vi/2;
        const fk = mu*m*g;
        const stop = Eci/fk;

        if(d>stop){
          throw new Error(
            'El objeto se detiene antes de recorrer esa distancia.'
          );
        }

        const Wf = -fk*d;

        const Ecf = Math.max(0,Eci+Wf);

        const vf = Math.sqrt(2*Ecf/m);

        result = {

          m,vi,mu,d,Eci,fk,stop,Wf,Ecf,vf

        };

        break;

      }

      case 'spring': {

        const m = p('m','Masa');
        const v = n('v','Rapidez');
        const k = p('k','Constante elástica');

        const Ec = m*v*v/2;

        const x = v*Math.sqrt(m/k);

        result = {m,v,k,Ec,x};

        break;

      }

      case 'stages': {

        const m = p('m','Masa');
        const h = n('h','Altura');
        const mu = n('mu','Coeficiente de fricción');
        const d = n('d','Distancia rugosa');
        const k = p('k','Constante elástica');

        const Em = m*g*h;

        const Wf = -mu*m*g*d;

        const Ec = Em+Wf;

        if(Ec<0){
          throw new Error(
            'El bloque no alcanza el resorte.'
          );
        }

        const v = Math.sqrt(2*Ec/m);

        const x = Math.sqrt(2*Ec/k);

        result = {m,h,mu,d,k,Em,Wf,Ec,v,x};

        break;

      }

      default:

        throw new Error(
          'Tipo de ejercicio no reconocido.'
        );

    }

    if(!Object.values(result).every(Number.isFinite)){

      throw new Error(
        'Resultado fuera del rango de cálculo.'
      );

    }

    return result;

  }

  window.STEMEnergyParameters = Object.freeze({

    g,

    number,

    calculate

  });

})();
