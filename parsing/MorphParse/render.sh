#!/bin/bash

rm render/* 

kindle_path=$HOME/kindle/HebrewBible
source_path=../../wlc

for book in Gen Ps Prov
do
	ls "$source_path/$book.xml" &&
	node nodeparse.js "$source_path/$book.xml" &&
	rm render/KUG.ncx render/Tanakh.opf.manifest render/Tanakh.opf.spine render/toc.html
	#cp ./render/* $kindle_path
	cp render/* /Users/brian.jolly/Downloads/kindle/HebrewBible/
done

