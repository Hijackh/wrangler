var dwp ={}

dwp.eigenvectors = [];
dwp.processQueue = [];

dwp.addEigenvector = function(eigenvector,chunkID,group,table) {
	if(dwp.eigenvectors.length == group) {
		var group0 = [chunkID];
		dwp.chunkGroup.push(group0);
		dwp.eigenvectors.push(eigenvector);
		dwp.processQueue.push(table);
	}else {
		var num = dwp.chunkGroup[group].length;
		dwp.chunkGroup[group].push(chunkID);
		for(var i = 0; i< dwp.eigenvectors[group].length; i++) {
			dwp.eigenvectors[group][i] = (dwp.eigenvectors[group][i] * num + eigenvector[i]) / (num + 1);

		}

	}
	return;
	
}
dwp.eigenvectorThreshold = 0.2;
dwp.chunkGroup = [];
var chunkCounter = 0;
var processedCounter = 0;
dwp.groupEigenvector = function(eigenvector,chunkID,table) {
	chunkCounter++;
	if(dwp.eigenvectors.length == 0) {
		dwp.addEigenvector(eigenvector,chunkID,0,table);
		return 0;
	}else {
		var length = dwp.eigenvectors.length;
		var minDiff = 1000;
		var group = length;
		for(var i = 0;i<length; i++) {
			if(dwp.eigenvectors[i].length != eigenvector.length) {
				continue;
			}
			var diff = 0;
			for(var j = 0; j < eigenvector.length; j++) {
				diff += Math.abs(eigenvector[j] - dwp.eigenvectors[i][j]);
			}
			if(diff < dwp.eigenvectorThreshold && diff < minDiff) {
				minDiff = diff;
				group = i;
			} 

		}
		
		dwp.addEigenvector(eigenvector,chunkID,group,table);


		return group;
	}
}

var initial_transforms_plus

dwp.wrangler = function(options,chunkID){
	var tContainer = options.tableContainer, previewContainer = options.previewContainer, transformContainer = options.transformContainer, table = options.table, originalTable = table.slice(), temporaryTable, vtable, afterTable, transform,
		engine, suggestions, editor, wrangler = {}, script, w = dw.wrangle(), tableSelection, scriptContainer = jQuery(document.createElement('div')).attr('id','scriptContainer'), editorContainer = jQuery(document.createElement('div')).attr('id','editorContainer'), dashboardContainer = options.dashboardContainer;
	console.log(table);
	initial_transforms_plus = options.initial_transforms
	if(options.initial_transforms){
		options.initial_transforms.forEach(function(t){
			w.add(t);
		})
		w.apply([table]);
	}
	

	
	
	console.log("startPoint");
	var eigenvector = []
	console.log(table);
	table.forEach(function(c, i){
			var length = c.length;
			var test = dw.get_column_stats_plus(c,length);
			for(var i = 0; i < test.length;i++) {
				eigenvector.push(test[i]);
			}
		})
    var groupCount = dwp.eigenvectors.length
	var group = dwp.groupEigenvector(eigenvector,1,originalTable);
	console.log("Queue")
	console.log(dwp.processQueue[0])
	var chunkState = document.getElementById("ChunkState")
	chunkState.innerHTML = "Chunk Processed : " + chunkCounter + "/10000";
	if(groupCount == group) {
		var DatasourceNum = document.getElementById("DatasourceNum")
		groupCount++
		DatasourceNum.innerHTML = "Datasource Detected : " + groupCount;
	}



	

}

//var tid = setTimeout(mycode, 2000);
function mycode() {
      var groupCount = dwp.eigenvectors.length
	var group = dwp.groupEigenvector(dwp.eigenvectors[0],1);
	
	var chunkState = document.getElementById("ChunkState")
	chunkState.innerHTML = "Chunk Processed : " + chunkCounter + "/10000";
	if(groupCount == group) {
		var DatasourceNum = document.getElementById("DatasourceNum")
		groupCount++
		DatasourceNum.innerHTML = "Datasource Detected : " + groupCount;
	}
  tid = setTimeout(mycode, 2000); // repeat myself
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

	return [pctMissing, pctDates,
			pctNumbers, pctStrings];
}



dwp.transform_menu = function(){
	
	var menu = {};
	
	var options = {}, interaction = options.interaction, transforms = [
		{name:'Title', sub:[{name:'DataWranglerPlus', context : 'DataWranglerPlus'}]},
		{name:'Chunk', sub:[{name:'PDatasourceNum',context : 'Datasource Processed : '+ processedCounter}]},	
		{name:'Chunk', sub:[{name:'DatasourceNum',context : 'Datasource Detected : 0'}]},
		{name:'Chunk', sub:[{name:'ChunkState',context : 'Chunk Processed : '+ chunkCounter + '/10000'}]}		
	

	];
	
	var vis = d3.select('#'+ "wranglerDashboard"), editor = dw.jq('div').addClass('detail_editor_container')


		
	menu.draw = function(){
		
		console.log(transforms)
		var idx = d3.range(transforms.length)

		var sub = vis.append('div').attr('id', 'menu').selectAll('div.menu_group')
		  .data(idx)
		  .enter().append('div')
			.attr('class', 'menu_group')

	  sub.selectAll('div.menu_option')
		  .data(function(d, i){return d3.range(transforms[d].sub.length).map(function(){return d})})
		  .enter().append('div')
			.attr('class', function(d, i){return 'title '} )
			.attr('id', function(d, i){return transforms[d].sub[i].name})
		  	.text(function(d, i) { return transforms[d].sub[i].context})
		    
	

		
	}	

	menu.draw();

	return menu;
}
	var container = jQuery('#table')
	var previewContainer = jQuery('#preview')

	
var startWrangler_update = function(dt){

		dw.wrangler({
			tableContainer:container,
			table:dt,
			transformContainer:jQuery('#transformEditor'),
			previewContainer:previewContainer,
      dashboardContainer:jQuery("#wranglerDashboard"),
			initial_transforms:initial_transforms_plus,
			plus:true
		})

	}
/*
dwp.wrangler = function(options){
	var tContainer = options.tableContainer, previewContainer = options.previewContainer, transformContainer = options.transformContainer, table = options.table, originalTable = table.slice(), temporaryTable, vtable, afterTable, transform,
		 suggestions, editor, wrangler = {}, script, w = dw.wrangle(), tableSelection, scriptContainer = jQuery(document.createElement('div')).attr('id','scriptContainer'), editorContainer = jQuery(document.createElement('div')).attr('id','editorContainer'), dashboardContainer = options.dashboardContainer;

	//jQuery('#transformEditor').removeClass('selectedExportHeader');
	//jQuery("#wranglerDashboard").empty();
	
	if(options.initial_transforms){
		options.initial_transforms.forEach(function(t){
			w.add(t);
		})
		w.apply([table]);
	}
	console.log("Export")
	
	//transformContainer.append(editorContainer).append(scriptContainer)

	engine = dw.engine().table(table);
	console.log(engine)

	//var transform_menu_plus = dwp.transform_menu()
	//var transform_menu = dw.transform_menu(dashboardContainer, {interaction:interaction, onclear:clear_editor, onedit:interaction, table:undefined})


	function interaction(params){

		dw.log(params)
		var selection = tableSelection.add(params);
	console.log("ExportInteraction")

		params.rows = selection.rows();
		params.cols = selection.cols();
		suggestions = engine.table(table).input(params).run(13);
		transform = suggestions[0];

		drawEditor();



		if (enable_proactive) {

			if(params.type==dw.engine.clear ||
				 params.type==dw.engine.execute) {


				drawTable();
			}
			else if(params.type === dw.engine.promote){
				editor.working();
			}
			else{

				if(params.type===dw.engine.param){
					editor.working()
				}
				else{
					editor.first_suggestion();
				}
			}

		}
		else {

			if(params.type === dw.engine.promote){
				editor.working();
			}
			else{

				if(params.type===dw.engine.param){
					editor.working()
				}
				else{
					editor.first_suggestion();
				}
			}

		}

		transform_menu.update({transform:editor.transform() || transform})

	}

	function infer_schema(){
		var typeTransforms = dw.infer_type_transforms(table);
		typeTransforms.forEach(function(t){
			t.sample_apply([table])
		})
	}

	function table_change(){
		transform = editor.transform()
		drawTable();
	}

	var warned = false;
	function confirmation(options){
		if(!warned){
			warned = true;
			alert('Wrangler only supports up to 40 columns and 1000 rows.  We will preview only the first 40 columns and 1000 rows of data.')

		}
	}

	vtable = dw.vtable(tContainer, {
		interaction:interaction,
		ontablechange:table_change,
		onexecute:execute_transform,
		onconfirm:confirmation,
		wrangler:w
	})


	afterTable = dw.vtable(previewContainer, {
		interaction:function(params){}
	})

	function highlight_suggestion(params){
		preview(params.transform)

		transform_menu.update({transform:params.transform})
		dw.log({type:'highlight_suggestion', suggestion:params.transform})
	}

	function execute_transform(transform, params){
		transform.sample_apply([table]);
		dw.summary.clear_cache();
		infer_schema()
		w.add(transform)
		tableSelection.clear()
		interaction({type:dw.engine.execute, transform:transform})
		drawScript()

		var x = jQuery('#scriptTransformContainer')
		x.scrollTop(100000);


	}

	function clear_editor(){
		tableSelection.clear()
		interaction({type:dw.engine.clear})
	}


	function promote_transform(transform, params){
		tableSelection.clear()
		interaction({type:dw.engine.promote, transform:transform})
	}



	tableSelection = dw.table_selection(vtable);

	wrangler.draw = function(){
		suggestions = engine.table(table).run();
		drawTable();
		drawEditor()
		drawScript()
	}



	function drawTable(){
		preview(transform);
	}

	function drawEditor(){
		editorContainer.empty();

		editor = dw.editor(editorContainer, suggestions, {onpromote:promote_transform, onhighlight:highlight_suggestion, onselect:execute_transform, onedit:interaction, table:table}).draw()
	}

	function exportTable(){
		var select = dw.jq('select').addClass('exportOptions');

		var buttons = jQuery('<form>\
		<input type="radio" name="exportType" value="data" checked="checked"/> Data<br />\
		<input type="radio" name="exportType" value="script" /> Script\
		</form>')

		buttons.find(':radio').height(15).width(15).click(function(e){
			select.empty()
			add_export_options()
		})

		var add_export_options = function(){
			if(buttons.find(':radio:checked').val()=='data'){
				add_export_option('csv', 'Comma-Separated Values (CSV)');
				add_export_option('tsv', 'Tab-Separated Values (TSV)');
				add_export_option('rowjson', 'Row-Oriented JSON (One object per row)');
				add_export_option('columnjson', 'Column-Oriented JSON (One array per column)');
				add_export_option('lookup_table', 'Lookup Table (currently supports 2 column table)');
				inputArea.attr('value', dw.wrangler_export(table, {}))
				inputArea.focus();
				inputArea.select();
				dw.log({type:'export', params:{type:'csv'}})
			}
			else{
				add_export_option('python', 'Python');
				add_export_option('javascript', 'JavaScript');
				inputArea.attr('value', dw.wrangler_export(table, {format:'python', wrangler:w}))
				inputArea.focus();
				inputArea.select();
				dw.log({type:'export', params:{type:'python'}})
				instructions.empty();

								instructions.append(python)


			}
		}

		var add_export_option = function(type, name){


			dw.add_select_option(select, name, type);


		}
		var python = 'To run python code, run <span class=\'terminal\'>easy_install datawrangler</span> or download the <a class=\'runtimeLink\' href=\'http://vis.stanford.edu/wrangler/files/python/DataWrangler-0.1.tar.gz\' target=\'_blank\'> python runtime.</a>'
		var javascript = 'To run javascript code, download the <a class=\'runtimeLink\' href=\'http://vis.stanford.edu/wrangler/files/javascript/dwrt-r0.1.js\' target=\'_blank\'> javascript runtime</a>.'
		select.change(function(){
			inputArea.attr('value', dw.wrangler_export(table, {format:select.val(), wrangler:w}))
			jQuery('.exportHeader').removeClass('selectedExportHeader');
			jQuery(this).addClass('selectedExportHeader')
			inputArea.focus();
			inputArea.select();
			dw.log({type:'export', params:{type:select.val()}})
			instructions.empty();
			if(select.val()==='python'){
				instructions.append(python)
			}
			if(select.val()==='javascript'){
				instructions.append(javascript)
			}
		})


		jQuery("#table").hide();
		var upload = dw.jq('div').attr('id', 'uploadContainer')


		upload.append(buttons)


		upload.append(select);

		var instructions = dw.jq('div').attr('id', 'scriptInstructions')



		jQuery('#profilerCenterPanel').prepend(upload)

		add_export_option('csv', 'Comma-Separated Values (CSV)');
		add_export_option('tsv', 'Tab-Separated Values (TSV)');
		add_export_option('rowjson', 'Row-Oriented JSON (One object per row)');
		add_export_option('columnjson', 'Column-Oriented JSON (One array per column)');
		add_export_option('lookup_table', 'Lookup Table (currently supports 2 column table)');






		upload.append(dw.jq('button').attr('id','wranglerInputSubmit').append('Back to Wrangling')
						.click(function(){
							upload.remove();
							jQuery("#table").show()
						})

		)



		var inputArea = dw.jq('textArea').attr('id','wranglerInput');
		upload.append(inputArea)
		inputArea.attr('value', dw.wrangler_export(table, {}))

		jQuery('.exportHeader:first').addClass('selectedExportHeader');

		inputArea.focus();
		inputArea.select();

		upload.append(instructions)

		clear_editor();
		dw.log({type:'export', params:{type:'csv'}})
	}

	function script_interaction(params){
		temporaryTable = originalTable.slice();




		dw.progress_call(w.apply, w, [temporaryTable])
		dw.log({type:'edit_script', params:params})
		table = temporaryTable;
		clear_editor();
		wrangler.draw();

	}
	function updateExport(){
		dt = dwp.processQueue[0];
		startWrangler_update(dt);

	}

	function drawScript(){
		var scrollTop = jQuery('#scriptTransformContainer').scrollTop();
		scriptContainer.empty();
		script = dw.script(scriptContainer, w, {
			edit:function(params){
				script_interaction(params)




			},
			onexport:updateExport,
			onedit:script_interaction,
			table:table





		}).draw()
		jQuery('#scriptTransformContainer').scrollTop(scrollTop);
	}

	function preview(transform){
		dw.preview(vtable, table, transform, afterTable, tableSelection);
	}


	jQuery(document).bind('keydown', function(event){

		var type = event && event.srcElement && event.srcElement.type

		if(type!='text'){
			switch(event.which){
		          	case 8:

		           	break
		        case 9:
					editor.promote()


					if(type!='textarea'){
		                event.preventDefault()
		            }
		            break
		        case 38:

					editor.prev()
					event.preventDefault()
		            break
		        case 40:

					editor.next()
		            event.preventDefault()
		            break
		        case 13:

					transform = editor.transform();
					execute_transform(transform)
					if(type!='textarea'){
		                event.preventDefault()
		            }
		            break
				case 27:
					clear_editor();
					break
		    }

		}
	    if(type!='textarea'){

	    }
	})

	infer_schema()




	wrangler.draw();



	return wrangler;
}
*/