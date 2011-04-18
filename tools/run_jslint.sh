#!/bin/bash

# See options here: http://www.jslint.com/lint.html
# 
JS_FILES=$(find src spec -name "*.js" -printf '%h/%f ' -type f)
PACKAGE_PREDEFS='assert,Ext,vrs'
TEST_PREDEFS='jasmine,AssertException,test,describe,it,expect,spyOn,beforeEach,afterEach,waitsFor,runs,_addStepToCurrentSpec,feature,story,component,concern,context,scenario,spec,given,when,then,and,but'
DEFAULT_ARGS='--maxerr 9999 --eqeqeq --evil --forin --immed --maxlen 100 --undef --devel --onevar --bitwise --sub --newcap'

java -jar deps/jslint4java/jslint4java-1.4.4.jar $DEFAULT_ARGS --predef $PACKAGE_PREDEFS,$TEST_PREDEFS $@ $JS_FILES

