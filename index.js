
var unallocated = []
  , allocated = []
  , totalAllocated = 0;

// 2d affine transformation matrix
var mat = module.exports = {
  make: function(a,b,c,d,x,y){
    var m = mat.ident(mat.alloc())
      , u = undefined;
    if( a !== u ) m[0] = a;
    if( b !== u ) m[1] = b;
    if( c !== u ) m[3] = c;
    if( d !== u ) m[4] = d;
    if( x !== u ) m[2] = x;
    if( y !== u ) m[5] = y;
    return m;
  },

  alloc: function(){
    if( !unallocated.length ){
      var i = totalAllocated;
      totalAllocated = (totalAllocated || 64) * 2; // double the size (128>256>512 etc)
      console.log('resizing from %d to %d',i,totalAllocated)
      allocated.length = totalAllocated;
      unallocated.length = totalAllocated;
      while(i < totalAllocated){
        var v = [1,0,0,0,1,0,0,0,1]; //new Array(9)
        unallocated[i] = v;
        allocated[i] = v;
        i++;
      }
    }
    return unallocated.pop();
  },

  free: function(v){
    unallocated.push(v)
  },

  ident: function(m){
    m = m || mat.make()
    m[0] = 1; // 0 0 / a
    m[1] = 0; // 0 1 / b
    m[2] = 0; // 0 2 / tx
    m[3] = 0; // 1 0 / c
    m[4] = 1; // 1 1 / d
    m[5] = 0; // 1 2 / ty
    m[6] = 0; // 2 0 / ?
    m[7] = 0; // 2 1 / ?
    m[8] = 1; // 2 2 / ?
    return m;
  },

  mul: function(a,b,m){
    m = mat.ident(m)
    m[0] = a[0]*b[0] + a[3]*b[1] // a*a + c*b
    m[1] = a[1]*b[0] + a[4]*b[1] // b*a + d*b
    m[3] = a[0]*b[3] + a[3]*b[4] // a*c + c*d
    m[4] = a[1]*b[3] + a[4]*b[4] // b*c + d*d
    m[2] = a[0]*b[2] + a[3]*b[2] + a[2] // a*tx + c*ty + tx
    m[5] = a[1]*b[2] + a[4]*b[5] + a[5] // b*tx + d*ty + ty
    return m;
  },

  //https://github.com/STRd6/matrix.js/blob/master/matrix.js
  translate: function(x,y,m){
    var a = mat.make(1,0,0,1,x,y)
    return m ? mat.mul(a,m) : a;
  },

  rotate: function(theta,m){
    var c = Math.cos(theta)
      , s = Math.sin(theta)
      , a = mat.make(c,s,-s,c);
    return m ? mat.mul(a,m) : a;
  },

  scale: function(x,y,m){
    var a = mat.make(x,0,0,y)
    return m ? mat.mul(a,m) : a;
  },

  inv: function(a,m){
    var d = a[0]*a[4] - a[1]*a[3];
    a = mat.make(
       a[4]/d,
      -a[1]/d,
      -a[3]/d,
       a[0]/d,
      (a[3]*a[5] - a[4]*a[2])/d,
      (a[1]*a[2] - a[0]*a[5])/d
    )
    return m ? mat.mul(a,m) : a;
  }
}