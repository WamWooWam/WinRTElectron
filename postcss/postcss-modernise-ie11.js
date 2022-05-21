function handleDisplay(decl, postcss) {
  if (decl.value == '-ms-flexbox') {
    let unprefixed = decl.clone({ value: 'flex' });
    decl.parent.append(unprefixed);
    //decl.parent.remove(decl);
  }
  if (decl.value == '-ms-grid') {
    let unprefixed = decl.clone({ value: 'grid' });
    decl.parent.append(unprefixed);
    //decl.parent.remove(decl);
  }
}

function convertFlexValue(value) {
  value = value.trim('"');
  if (value == 'start')
    value = 'flex-start';
  if (value == 'end')
    value = 'flex-end';
  if (value == 'justify')
    value = 'space-between';
  if (value == 'distribute')
    value = 'space-around';

  return value;
}

function handleFlexProp(decl, postcss) {
  let prop = decl.prop;
  let value = decl.value;
  let unprefixed = null;

  if (prop == '-ms-flex') {
    unprefixed = decl.clone({ prop: 'flex' });
  }

  if (prop == '-ms-flex-order') {
    unprefixed = decl.clone({ prop: 'order' });
  }

  if (prop == '-ms-flex-direction') {
    unprefixed = decl.clone({ prop: 'flex-direction' });
  }

  if (prop == '-ms-flex-wrap') {
    if (value == '"no-wrap"')
      value = 'nowrap';

    unprefixed = decl.clone({ prop: 'flex-wrap', value });
  }

  if (prop == '-ms-flex-pack') {
    unprefixed = decl.clone({ prop: 'justify-content', value: convertFlexValue(value) });
  }

  if (prop == '-ms-flex-align') {
    unprefixed = decl.clone({ prop: 'align-items', value: convertFlexValue(value) });
  }

  if(prop == '-ms-flex-order'){
    unprefixed = decl.clone({ prop: 'order', value });
  }

  if (unprefixed !== null) {
    decl.parent.append(unprefixed);
    //decl.parent.remove(decl);
  }
}

function handleGridProp(decl, postcss) {
  let prop = decl.prop;
  let value = decl.value;
  let unprefixed = null;

  if (prop == '-ms-grid-rows') {
    unprefixed = decl.clone({ prop: 'grid-template-rows' });
  }

  if (prop == '-ms-grid-row') {
    unprefixed = decl.clone({ prop: 'grid-row-start' });
  }

  if (prop == '-ms-grid-row-span') {
    unprefixed = decl.clone({ prop: 'grid-row-end', value: "span " + value });
  }

  if (prop == '-ms-grid-row-align') {
    unprefixed = decl.clone({ prop: 'align-items', value: convertFlexValue(value) });
  }

  if (prop == '-ms-grid-columns') {
    unprefixed = decl.clone({ prop: 'grid-template-columns' });
  }

  if (prop == '-ms-grid-column') {
    unprefixed = decl.clone({ prop: 'grid-column-start' });
  }

  if (prop == '-ms-grid-column-span') {
    unprefixed = decl.clone({ prop: 'grid-column-end', value: "span " + value });
  }

  if (prop == '-ms-grid-column-align') {
    unprefixed = decl.clone({ prop: 'justify-content', value: convertFlexValue(value) });
  }

  if (unprefixed !== null) {
    decl.parent.append(unprefixed);
   // decl.parent.remove(decl);
  }
}

module.exports = (opts = {}) => {

  // Work with options here

  return {
    postcssPlugin: 'modernise-ie10',
    /*
    Root (root, postcss) {
      // Transform CSS AST here
    }
    */

    Declaration: function (decl, postcss) {
      if (decl.prop == 'display') {
        handleDisplay(decl, postcss);
      }

      if (decl.prop.startsWith('-ms-flex')) {
        handleFlexProp(decl, postcss);
      }

      if (decl.prop.startsWith('-ms-grid')) {
        handleGridProp(decl, postcss);
      }

      if(decl.prop == "-ms-transform"){
        let transform = decl.clone({ prop: 'transform' });
        decl.parent.append(transform);
        //decl.parent.remove(decl);
      }
    },

    AtRule: function(rule, postcss) {
      if(rule.name == "-ms-keyframes") {
        let keyframes = rule.clone({name: "keyframes"});
        rule.parent.append(keyframes);
        //rule.parent.remove(rule);
      }
    }

    /*
    Declaration: {
      color: (decl, postcss) {
        // The fastest way find Declaration node if you know property name
      }
    }
    */
  }
}
module.exports.postcss = true