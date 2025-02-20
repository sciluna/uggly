// convert cy graph data to space separated values (name is tsv but inserts space, not tab) 
let cyToTsv = function (cyElements) {
  let tsvString = "";
  cyElements.edges().forEach(edge => {
    let source = edge.source();
    let target = edge.target();
    tsvString += source.id() + " " + target.id();
    tsvString += "\n";
  });
  return tsvString;
};

export { cyToTsv };