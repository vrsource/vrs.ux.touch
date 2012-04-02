// To add

component('Jasmine Test Helpers', function() {

   component('toBeEmpty', function() {
      it('should pass when empty', function() {
         var empty_list = [];
         expect(empty_list).toBeEmpty();
      })
      it('should fail when list not empty', function() {
         var full_list = [1,2,3];
         expect(full_list).not.toBeEmpty();
      });
   });

   component('toBeLength', function() {
      it('should work with empty', function() {
         var list = [];
         expect(list).toBeLength(0);
      });
      it('should work with elements', function() {
         var list = [1,2,3];
         expect(list).toBeLength(3);
      });
   });

});

