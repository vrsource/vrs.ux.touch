#! watchr

watch(/.*app\/static\/[src|spec].*\.js/) do |md|
   Dir.chdir(File.dirname(__FILE__)) do
      ret = `python run_jslint.py` # run linter
      if $?.exitstatus != 0
         puts ret # Print output since we failed
         puts "------ JS Lint Failed -------"
      else
         puts "-------------\nJS Lint Passed" # since jslint is silent on success print a warm fuzzy
      end
   end
end

