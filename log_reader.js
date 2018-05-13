
// Usage: node test_script.js input_file=file_name output_file=output_filename
// flags: --test: will ignore input_file and output_file parameter and create 2 test files for reading and writing out
//        --no-logs: console log will not show progress during that time. 
// filesystem
var fs = require('fs');
var program_start_time = process.hrtime();
var default_input_file_name = "input_logs.txt";
var default_output_file_name = "output_report.txt";
var test_file_name = "test_log_file.txt";
var default_test_output_name = "test_report.txt"
// do not exceed 500k or it will take a while
var max_line_for_test_file = 500000;
function create_fake_file(test_file_name){
// creating a test log file for reading lines
    output_stream = fs.createWriteStream(test_file_name);
    const fakeFilePromise = new Promise(function(resolve, reject){
    for(var i = 0; i<max_line_for_test_file; i++){
        let current_year = 1970 + i;
        let line="0.0.0.0.0 GET url/url "+current_year +"/12/21 +0800"
        output_stream.write(line+"\n");
      }      
    }).then(function whenOk(response){
      output_stream.end();	 
    }).catch(function notOk(err){
      console.error(err);
    });
}

// creating a object for outputting a report
function creating_objects(input_file_name, output_file_name, console_logs){
  let readline = require('readline');
  let instream = fs.createReadStream(input_file_name);
  var file_size = 0;
  let outstream = fs.createWriteStream(output_file_name);
  rl = readline.createInterface(instream, outstream);
  var lines = 0;
  var report_object = {};
  const myPromise = new Promise(function(resolve, reject){
    // reading stream starting time
    starting_second = process.hrtime();
    rl.on('line', function (line) {
      if(console_logs){
        console.log("Reading line:"+lines);
      }
      file_size = instream.bytesRead;	
      lines = lines+1;
    });
    
    rl.on('close', function (line){
	// will record the end time after rl is close
      ending_second = process.hrtime();
      nano_seconds_used = ending_second[1]-starting_second[1];
      resolve({lines: lines,
              total_time: ending_second[0]-starting_second[0],
              total_time_in_nano: nano_seconds_used,
              total_time_in_micro: nano_seconds_used/1000,
              filesize: file_size
            }
      );
    });
  }).then(function whenOk(response){
    if(console_logs){
    console.log("creating report");}	
    creatingReport(response, outstream, console_logs);
  }).catch(function notOk(err){
    console.error(err);
  });
}
function creatingReport(input_object, outstream, console_logs){
  // creating a report from the object that created via creating_objects method
  const myPromise = new Promise(function(resolve, reject){
    used_second = input_object.total_time;
    outstream.write("File size: "+ input_object.filesize);
    outstream.write("\nTotal lines: "+ input_object.lines);
    if(used_second<=0){
      used_second=1;
    }
    outstream.write("\nTime used(in seconds): "+used_second);
    outstream.write("\nRead buffer throught rate(in bytes/s): "+input_object.filesize/used_second);
    end_time = process.hrtime();
    outstream.write("\nDuration (in seconds): "+(end_time[0]-program_start_time[0]));
  }).then(function whenOk(response){
	if(console_logs){
	console.log("Report finish, closing program");}
    outstream.close();
  }).catch(function notOk(err){
    console.error(err);
  });
}

//
var arguements = process.argv.slice(2);
var argument_object = {
  input_file_name: default_input_file_name,
  output_file_name: default_output_file_name,
  console_log: true,
  test_run:false}

// this is for checking additional arguments
const myPromise = new Promise(function(resolve, reject){
  for(var i=0;i<arguements.length;i++){
    if(arguements[i].indexOf("inputfile=")>=0){
      inputfile_args = arguements[i].split("inputfile=");
      argument_object.input_file_name=inputfile_args[1]||argument_object.input_file_name;
    }
    if(arguements[i].indexOf("outputfile=")>=0){
      output_file_name_args = arguements[i].split("outputfile=");
      argument_object.output_file_name=output_file_name_args[1]||argument_object.output_file_name;
    }
    if("--test".indexOf(arguements[i])>=0){
      console.log("testing flag enabled");
      argument_object.test_run=true;
    }

    if("--no-logs".indexOf(arguements[i])>=0){
      console.log("Disabling console logs");
      argument_object.console_log=false;
    }
  }
  resolve(argument_object);
}).then(function whenOk(response){
  if(argument_object.test_run){
    console.log("testing");
    test_functions(argument_object.console_log);
  }
  else{
  creating_objects(
    argument_object.input_file_name, argument_object.output_file_name, argument_object.console_log);
  }
}).catch(function notOk(err){
  console.error(err);
});

function test_functions(enable_logging){
  const test_promise = new Promise((resolve,reject)=>{resolve(create_fake_file(test_file_name));}).then(
  creating_objects(test_file_name, default_test_output_name, enable_logging));
}
