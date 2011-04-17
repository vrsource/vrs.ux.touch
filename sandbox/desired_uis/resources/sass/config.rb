# Get the local directory where SASS files are
sass_path = File.dirname(__FILE__)

# Find the CSS directory (resources/css)
css_path = File.join(sass_path, "..", "css")

# Find the images directory (resources/img)
images_dir = File.join(sass_path, "..", "img")

# Load the sencha-touch framework directory
sencha_touch_dir = File.join(sass_path, "..", "..", "..", "..", "deps", "sencha_touch")
load File.join(sencha_touch_dir, "resources", "themes")

# Setup the output style/environment
output_style = :expanded    # :expanded, :compact, :compressed
environment = :development  # :development or :production
