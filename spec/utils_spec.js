// To add

component('Test assert', function() {

   it('should throw exception on assert', function() {
      expect(function() {
         assert(false, "");
      }).toThrow();
   });

   it('should convert to string', function() {
      var ex = new AssertException('blah');
      expect(ex.toString()).toBeTruthy();
   });

});

component("Test endsWith", function()
{
   it("should return true for suffix", function()
   {
      expect(vrs.endsWith("something", "thing")).toBeTruthy();
   });

   it("should return false for wrong suffix", function()
   {
      expect(vrs.endsWith("something", "else")).toBeFalsy();
   });
});

component("Test startsWith", function()
{
   it("should return true for prefix", function()
   {
      expect(vrs.startsWith("something", "some")).toBeTruthy();
   });

   it("should return false for wrong prefix", function()
   {
      expect(vrs.startsWith("something", "else")).toBeFalsy();
   });
});

component("Test getFileExtension", function()
{
   it("should return extension for filename", function()
   {
      expect(vrs.getFileExtension("photo.png")).toEqual("png");
   });

   it("should return empty string for no extension", function()
   {
      expect(vrs.getFileExtension("photo")).toEqual("");
   });
});
