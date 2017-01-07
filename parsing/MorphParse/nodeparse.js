var MorphParse = require("./MorphParse"),
	strongs = require("./strongs-hebrew-dictionary").strongsHebrewDictionary,
	fs = require('fs'),
	xml2js = require('xml2js');

var parser = new xml2js.Parser();

var head = ""
+'<?xml version="1.0" encoding="utf-8" standalone="no"?>'
+'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"'
+'"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">'
+'<html xmlns="http://www.w3.org/1999/xhtml" xmlns:xml="http://www.w3.org/XML/1998/namespace">'
+'<head>'
+'<meta charset="utf-8">'
+'<title>Tanakh</title>'
+'<link rel="stylesheet" href="Tanakh.css" type="text/css" />'
+'</head>'
+'<body>'
+'<div>';

var close = '</div>' +'</body>' +'</html>'; 

var html = "";
var footnote_html = "";

var printWord = function(word, id, chapter_file, footnote_file) {
	var word_html = "<span>span</span><a epub:type='noteref' href='"+footnote_file+"#foot."+id+"' id='"+id+"'>"+word._+"</a> ";

	var morph = word.$.morph
	var lemma = word.$.lemma;

	var myRegexp = /(\d+)/;
	var match = myRegexp.exec(lemma);
	if (match) {
		var strong_num = strongs["H"+match[1]];
	}
	else {
		var strong_num = 0;
	}
	var strong_lookup = strong_num;

	var footnote = "<div epub:type='footnote' id='foot."+id+"' class='footnote'>"
		footnote += "<p><a href='"+chapter_file+"#"+id+"'>"+strong_lookup["lemma"]+"</a> / "+strong_lookup["xlit"]+" / "+strong_lookup["pron"]+"  / </p>";
	footnote += "<p class='morph'>"+MorphParse.Parse(morph)+" / </p>";
	footnote += "<p>"+strong_lookup["strongs_def"]+" / "+strong_lookup["kjv_def"]+" / </p>";
	footnote += "<p>"+strong_lookup["derivation"]+" </p>";
	footnote += "<p>&nbsp;</p>";
	footnote += "</div>";

	return {word: word_html, footnote: footnote};
};

var writeOut = function(file_name, text) {
	//fs.appendFileSync("./render/"+file_name, text, function(err) {
	fs.appendFileSync("./render/"+file_name, text);
}

var toc_html_chp = "";
var toc_html_foot = "";
var tanakh_opf_spine_chp = "";
var tanakh_opf_spine_foot = "";
var tanakh_opf_manifest_chp = "";
var tanakh_opf_manifest_foot = "";
var kug_ncx_chp = "";
var kug_ncx_foot = "";

var xmlFile = process.argv[2];;

if (!xmlFile) { xmlFile = '../../wlc/Prov.xml'; }

//fs.readFile(__dirname + '/test.xml', function(err, data) {
fs.readFile(xmlFile, function(err, data) {
	parser.parseString(data, function (err, result) {

		var chapters = result.osis.osisText[0].div[0].chapter;

		chapters.forEach((chapter,ci) => {
			//var chapter = result.chapter;
			chapterID = chapter.$.osisID;

			var chapter_file = chapterID+".html";
			var footnote_file = chapterID+".footnotes.html";

			toc_html_chp = "<p><a href='"+chapter_file+"'> "+ci+" </a></p>\n";
			toc_html_foot ="<p><a href='"+footnote_file+"'> "+ci+" footnote</a></p>\n";

			tanakh_opf_spine_chp = "<itemref idref='"+chapterID+"' />\n";
			tanakh_opf_spine_foot = "<itemref idref='"+chapterID+".footnotes' />\n";
			tanakh_opf_manifest_chp = "<item id='"+chapterID+"' media-type='application/xhtml+xml' href='"+chapter_file+"'></item>\n";
			tanakh_opf_manifest_foot = "<item id='"+chapterID+".footnotes' media-type='application/xhtml+xml' href='"+footnote_file+"'></item>\n";
			kug_ncx_chp = "<navPoint class='chapter' id='"+chapterID+"' playOrder='"+ci+"'><navLabel><text>"+chapterID+"</text></navLabel><content src='"+chapter_file+"'/></navPoint>\n";
			kug_ncx_foot = "<navPoint class='chapter' id='"+chapterID+".footnotes' playOrder='"+ci+"'><navLabel><text>"+chapterID+".footnotes</text></navLabel><content src='"+footnote_file+"'/></navPoint>\n";


writeOut("toc.html", toc_html_chp);
writeOut("toc.html", toc_html_foot);
writeOut("Tanakh.opf.spine", tanakh_opf_spine_chp);
writeOut("Tanakh.opf.spine", tanakh_opf_spine_foot);
writeOut("Tanakh.opf.manifest", tanakh_opf_manifest_chp);
writeOut("Tanakh.opf.manifest",	tanakh_opf_manifest_foot);
writeOut("KUG.ncx", kug_ncx_chp);
writeOut("KUG.ncx", kug_ncx_foot);

//writeOut("toc.html", toc_html_chp +"\n"+ toc_html_foot);
//writeOut("Tanakh.opf.spine", tanakh_opf_spine_chp +"\n"+ tanakh_opf_spine_foot);
//writeOut("Tanakh.opf.manifest", tanakh_opf_manifest_chp +"\n"+ tanakh_opf_manifest_foot);
//writeOut("KUG.ncx", kug_ncx_chp +"\n"+ kug_ncx_foot);



			html = head;
			footnote_html = head;
			html += "<h1>"+chapterID+"</h1>\n";

			var verse = "";
			var footnotes = "";
			chapter.verse.forEach((v,vi) => {
				var verseID = v.$.osisID 
				var vnum = vi+1;

				verse = "";
				footnotes = "";

				html += "<p class='verse' dir='rtl'>"+vnum+" ";

				v.w.forEach((word, i) => {
					res = printWord(word, verseID+"."+i, chapter_file, footnote_file);
					verse += res.word;
					footnotes += res.footnote+"\n";
				});
				html += verse+"</p>\n";
				footnote_html += footnotes;
			});
			html += close;
			footnote_html += close;

			writeOut(footnote_file, footnote_html);
			writeOut(chapter_file, html);
		});
	});
});


