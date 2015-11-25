dw.wrangler_plus = function(options){
	var tContainer = options.tableContainer, previewContainer = options.previewContainer, transformContainer = options.transformContainer, table = options.table, originalTable = table.slice(), temporaryTable, vtable, afterTable, transform,
		engine, suggestions, editor, wrangler = {}, script, w = dw.wrangle(), tableSelection, scriptContainer = jQuery(document.createElement('div')).attr('id','scriptContainer'), editorContainer = jQuery(document.createElement('div')).attr('id','editorContainer'), dashboardContainer = options.dashboardContainer;

	

	
	if(options.initial_transforms){
		options.initial_transforms.forEach(function(t){
			w.add(t);
		})
		w.apply([table]);
	}
	console.log("startPoint");
	var eigenvectors = []
	table.forEach(function(c, i){
			var length = c.length;
			var test = dw.get_column_stats_plus(c,length);
			eigenvectors.push(test);
		})

}


dw.get_column_stats_plus = function(col, nRows) {
	var numMissing = 0;
	var numDates = 0;
	var numNumbers = 0;
	var numStrings = 0;

	var numCommas = 0;
	var numColons = 0;
	var numPipes = 0;
	var numTabs = 0;


	for (var r = 0; r < nRows; r++) {
		var elt = col[r];
		if (dw.is_missing(elt)) {
			numMissing++;
		}
		else if (dw.date_parse(elt)) {
			numDates++;
		}
		else if (!isNaN(Number(elt))) {
			numNumbers++;
		}
		if (elt) {
			var commas = elt.match(/,/g);
			var colons = elt.match(/\:/g);
			var pipes = elt.match(/\|/g);
			var tabs = elt.match(/\t/g);
			if (commas) numCommas += commas.length;
			if (colons) numColons += colons.length;
			if (pipes) numPipes += pipes.length;
			if (tabs) numTabs += tabs.length;
		}
	}
	numStrings = nRows - numMissing - numNumbers - numDates;

	var numRealElts = nRows - numMissing;


	var colHomogeneity = 0;

	var pctMissing = numMissing / nRows;
	var pctDates = numDates / nRows;
	var pctNumbers = numNumbers / nRows;
	var pctStrings = numStrings / nRows;


	

	colHomogeneity = pctDates*pctDates + pctNumbers*pctNumbers + pctStrings*pctStrings;

	return {pctMissing : pctMissing, pctDates : pctDates,
			pctNumbers : pctNumbers, pctStrings :pctStrings};
}