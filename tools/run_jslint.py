#!/usr/bin/env python
import subprocess
import glob
import os, sys
pj = os.path.join

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(base_dir)

# Find all the source files to check
source_dirs = ['src', 'spec', 'examples']
js_files    = []
for d in source_dirs:
   for root, dirs, files in os.walk(d):
      js_files.extend([pj(root, f) for f in files if f.endswith(".js")])

package_predefs = ['Ext' , 'assert', 'vrs']
test_predefs    = ['jasmine', 'AssertException', 'test', 'describe', 'it', 'expect', 'spyOn',
                   'beforeEach', 'afterEach', 'waitsFor', 'waits', 'runs', '_addStepToCurrentSpec',
                   'feature', 'story', 'component', 'concern', 'context', 'scenario', 'spec',
                   'given', 'when', 'then', 'and', 'but', 'summary', 'details',
                   "navigator", "document", "window", "goog", "setTimeout"]

predefs = package_predefs + test_predefs

args = ['--eqeqeq', '--evil', '--forin', '--immed', '--undef', '--devel', '--onevar',
        '--bitwise', '--sub', '--newcap', '--maxerr', '9999', '--maxlen', '100',
        '--predef', ",".join(predefs)]

args.extend(sys.argv[1:])

jar_path = pj(base_dir,"deps","jslint4java","jslint4java-1.4.4.jar")

command = ['java', '-jar', jar_path] + args + js_files

try:
   proc = subprocess.Popen(command, stdout = subprocess.PIPE)
   retcode = proc.wait()
   #print "Ret code: ", retcode
   for l in proc.stdout.readlines():
      stripped = l.rstrip()
      if stripped:
         print stripped
except subprocess.CalledProcessError, ex:
   sys.exit(ex.returncode)

#print "ret code 2: ",  proc.returncode
sys.exit(proc.returncode)

