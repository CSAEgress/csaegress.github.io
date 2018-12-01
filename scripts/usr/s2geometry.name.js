define(["ext/s2geometry"], function(){

    // facenames and codewords
    var facenames = [ 'AF', 'AS', 'NR', 'PA', 'AM', 'ST' ];
    var codewords = [
        'ALPHA',    'BRAVO',   'CHARLIE', 'DELTA',
        'ECHO',     'FOXTROT', 'GOLF',    'HOTEL',
        'JULIET',   'KILO',    'LIMA',    'MIKE',
        'NOVEMBER', 'PAPA',    'ROMEO',   'SIERRA',
    ];

    var regionToLatLong = function(region) {
        // rot, d2xy, facenames, and codewords taken from regions.user.js
        var rot = function(n, x, y, rx, ry) {
            if(ry == 0) {
                if(rx == 1) {
                    x = n-1 - x;
                    y = n-1 - y;
                }
                return [y, x];
            }
            return [x, y];
        };

    var d2xy = function(n, d) {
      var rx, ry, s, t = d, xy = [0, 0];
      for(s=1; s<n; s*=2) {
        rx = 1 & (t/2);
        ry = 1 & (t ^ rx);
        xy = rot(s, xy[0], xy[1], rx, ry);
        xy[0] += s * rx;
        xy[1] += s * ry;
        t /= 4;
      }
      return xy;
    }
    // inspired by regions.user.js getSearchResult
    region = region.split("-");
    var faceId = facenames.indexOf(region[0].slice(0, 2));
    var regionI = parseInt(region[0].slice(2)) - 1;
    var regionJ = codewords.indexOf(region[1]);
    var xy = d2xy(4, parseInt(region[2]));
    regionI = (regionI << 2) + xy[0];
    regionJ = (regionJ << 2) + xy[1];
    var cell = (faceId % 2 == 1)
    ? S2.S2Cell.FromFaceIJ(faceId, [regionJ,regionI], 6)
    : S2.S2Cell.FromFaceIJ(faceId, [regionI,regionJ], 6);
    return cell.getLatLng();
  }

  // borrowed from the "regions" plugin
  function regionName(cell) {
    // ingress does some odd things with the naming. for some faces, the i and j coords are flipped when converting
    // (and not only the names - but the full quad coords too!). easiest fix is to create a temporary cell with the coords
    // swapped
    if (cell.face == 1 || cell.face == 3 || cell.face == 5) {
      cell = S2.S2Cell.FromFaceIJ ( cell.face, [cell.ij[1], cell.ij[0]], cell.level );
    }

    // first component of the name is the face
    var name = facenames[cell.face];

    if (cell.level >= 4) {
      // next two components are from the most signifitant four bits of the cell I/J
      var regionI = cell.ij[0] >> (cell.level-4);
      var regionJ = cell.ij[1] >> (cell.level-4);

      name += zeroPad(regionI+1,2)+'-'+codewords[regionJ];
    }

    if (cell.level >= 6) {
      // the final component is based on the hibbert curve for the relevant cell
      var facequads = cell.getFaceAndQuads();
      var number = facequads[1][4]*4+facequads[1][5];

      name += '-'+zeroPad(number,2);
    }


    return name;
  }



});
