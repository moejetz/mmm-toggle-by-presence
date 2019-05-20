// Name of program mainreturn.cpp
using namespace std;
#include <iostream>
#include <time.h>
#include <fstream>
#include "VL53L1X.h"
#include <unistd.h>
#include <ctime>

VL53L1X Distance_Sensor;

#if defined(__linux__)
#  include <unistd.h>
#  define sleep(s) usleep((s)*1000)
#  include <unistd.h>
#  define GetCurrentDir getcwd
#elif defined(_WIN32)
#  include <windows.h>
#  define sleep(s) Sleep((s)*1000)
#  include <direct.h>
#  define GetCurrentDir _getcwd
#endif


std::string GetDetectionStateFilePath( void ) {
  char buff[FILENAME_MAX];
  GetCurrentDir( buff, FILENAME_MAX );
  std::string current_working_dir(buff);
  return current_working_dir + "/modules/mmm-toggle-by-presence/range_detector/detection_state";
}


int main(int argc, char** argv) {

    if(argc != 2) {
        cout << "please set updateInterval, e.g. ./main 500" << "\n";
        return -1;
    }

    int updateInterval = atoi( argv[1] );

    cout << "Update interval set: " << updateInterval << "ms" << "\n";
    if(updateInterval < 500) {
        cout << "setting update interval to minimal value: 500ms" << "\n";
        updateInterval = 500;
    }

    string detectionStateFilePath = GetDetectionStateFilePath();
    ofstream filestream;

    // VL53L1X sensor initialization
    Distance_Sensor.begin();

    while(1) {

        Distance_Sensor.startMeasurement(); //Write configuration bytes to initiate measurement

          //Poll for completion of measurement. Takes 40-50ms.
        while(Distance_Sensor.newDataReady() == false){
            usleep(5);
        }
        int distance = Distance_Sensor.getDistance(); //Get the result of the measurement from the sensor

        filestream.open(detectionStateFilePath);
        if (filestream.is_open()){ //checking for existence of file
            filestream << distance;
            filestream.close(); //closes file after done
        } else {
            std::ofstream outfile (detectionStateFilePath);
            outfile.close();
        }

        sleep (updateInterval);
    }

    return -1;

}

