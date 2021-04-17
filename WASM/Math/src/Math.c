//This define statement is really only for WebAssembly Studio...
#define WASM_EXPORT __attribute__((visibility("default")))

WASM_EXPORT
double* subtractArrays(int arr1length, int arr2length, double arr1[arr1length], double const arr2[arr2length]){
  //If the first array is shorter than the second one, then just subtract the first array by the second array up until there is no more values in the second array.
  if(arr1length <= arr2length){
    for(int i = 0;i<arr1length;++i){
      arr1[i] -= arr2[i];
    }
  }
  else{
    for(int i = 0;i<arr2length;++i){
      arr1[i] -= arr2[i];
    }
  }
  return arr1;
}