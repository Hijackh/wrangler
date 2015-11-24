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

	table.forEach(function(c, i){
			var length = c.length;
			var test = dw.get_column_stats_plus(c,length);
			console.log(test);
		})
}