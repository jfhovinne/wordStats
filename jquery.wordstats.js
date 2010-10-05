/* jQuery wordStats plugin: tries to determine what a page is about
 * by computing the density of its keywords
 * Copyright (C) 2007 Jean-Francois Hovinne - http://www.hovinne.com/
 * Dual licensed under the MIT (MIT-license.txt)
 * and GPL (GPL-license.txt) licenses.
 */
 
jQuery.wordStats = {

    unsortedWords: null,
    sortedWords: null,
    topWords: null,
    topWeights: null,
    _computed: false,

    //add words from provided string to unsortedWords array
    addWords: function(str, weight) {
        if(str && str.length > 1) {
            var w = this.splitWords(str.toLowerCase());
            for(var x = 0, y = w.length; x < y; x++) {
                word = w[x];
                if(word.length > 1 && !this.stopWords[word]) {
                    word = '_' + word;
                    if(this.unsortedWords[word])
                        this.unsortedWords[word] += weight;
                    else this.unsortedWords[word] = weight;
                }
            }
        } 
    },

    //add words from text nodes only
    addWordsFromTextNodes: function(node, weight) {
        var nodes = node.childNodes;
        for(var i = 0, j = nodes.length; i < j; i++) {
            if(nodes[i].nodeType == 3) this.addWords(nodes[i].nodeValue, weight);
        }
    },
    
    //accept Latin-1 basic + Latin-1 extended characters
    testChar: function(c) {
        return((c >= 97 && c <= 122)
            || (c >= 128 && c <= 151)
            || (c >= 160 && c <= 164)
            || (c >= 48 && c <= 57)
            || (c >= 224 && c <= 246)
            || (c >= 249 && c <= 255));
    },

    //split words
    splitWords: function(words) {
        var w = new Array(), str = '';
        for(var i = 0, j = words.length; i < j; i++) {
            c = words.charCodeAt(i);
            if(this.testChar(c)) str += words.substring(i, i + 1);
            else {
                w.push(str);
                str = '';
            }
        }
        
        if(str.length > 0) w.push(str);
        return(w);
    },

    //main function: compute words from web page / element
    computeWords: function(elem) {
        
        if(!elem) elem = window.document;
        
        this.unsortedWords = new Array();
        
        this.addWords($('title', elem).text(), 20);
        
        wordstats = this;
       
        $('h1', elem).each(function() {
            wordstats.addWordsFromTextNodes($(this).get(0), 15);
        });

        $('h2', elem).each(function() {
            wordstats.addWordsFromTextNodes($(this).get(0), 10);
        });

        $('h3, h4, h5, h6', elem).each(function() {
            wordstats.addWordsFromTextNodes($(this).get(0), 5);
        });

        $('strong, b, em, i', elem).each(function() {
        	wordstats.addWordsFromTextNodes($(this).get(0), 3);
        });

        $('p, div, th, td, li, a, span', elem).each(function() {
        	wordstats.addWordsFromTextNodes($(this).get(0), 2);
        });

        $('img', elem).each(function() {
            wordstats.addWords($(this).attr('alt'), 1);
            wordstats.addWords($(this).attr('title'), 1);
        });
        
        this._computed = true;
    },
    
    //compute 'top' words: words which occur the most frequently
    computeTopWords: function(count, elem) {
    
        if(!this._computed) this.computeWords(elem);
    
        this.topWords = new Array();
        this.topWeights = new Array();
        
        this.topWeights.push(0);
        for(word in this.unsortedWords) {
            for(var i = 0; i < count; i++) {
                if(this.unsortedWords[word] > this.topWeights[i]) {
                    this.topWeights.splice(i, 0, this.unsortedWords[word]);
                    this.topWords.splice(i, 0, word);
                    break;
                }
            }
        }
    },
    
    //sort the unsortedWords array, based on words 'weights' descending
    sortWords: function() {
        this.sortedWords = new Array();
        //sort the associative array desc
        i = 0;
        for(word in this.unsortedWords) { this.sortedWords[i] = word; i++; }
        this.sortedWords.sort(function(a, b) {
                return wordstats.unsortedWords[b] - wordstats.unsortedWords[a];
            }
        );
    },
    
    //release memory
    clear: function() {
        this.unsortedWords
        = this.sortedWords
        = this.topWords
        = this.topWeights
        = null;
        this._computed = false;
    }
};
