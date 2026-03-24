class APIErrorHandler extends Error{
     constructor(statusCode,message="something went wrong ",errors=[],stack){
          super();
          this.statusCode=statusCode;
          this.message=message;
          this.errors=errors;
          this.stack=stack
          this.data=null;
          this.success=false;
     }
}
export default APIErrorHandler