#! env watchr
# Run from the base directory of the project
def _lint()
   Dir.chdir(File.dirname(__FILE__)) do
      puts "Running..."
      ret = `python run_jslint.py` # run linter
      if $?.exitstatus != 0
         puts ret # Print output since we failed
         puts "------ JS Lint Failed -------"
      else
         puts "-------------\nJS Lint Passed" # since jslint is silent on success print a warm fuzzy
      end
   end
end

_lint()

watch(/^(src|spec|examples).*\.js/) do |md|
   _lint()
end

