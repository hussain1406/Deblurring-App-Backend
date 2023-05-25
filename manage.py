import os
import argparse

argParser = argparse.ArgumentParser()
argParser.add_argument("-m", "--model-name", required=True,type=str, help="Model Name")
argParser.add_argument("-i", "--input-dir", required=True,type=str, help="Directory in which input files are placed")
argParser.add_argument("-o", "--output-dir", required=True,type=str,help="Directory in which output files should be placed")
argParser.add_argument("-f", "--output-file-name", required=True,type=str,help="Output File Name")

args = argParser.parse_args()

cwd = os.getcwd()
os.path.join(cwd,args.input_dir)
model = f"""{os.path.join("Restormer",args.model_name)}"""
input = f"{os.path.join(cwd,args.input_dir)}"
output= f"{os.path.join(cwd,args.output_dir)}"
output_file_name= f"{os.path.join(cwd,args.output_file_name)}"

os.makedirs(output, exist_ok=True)

os.system(f"python3 {model}.py -i '{input}' -o '{output}'")
# print(f"python3 {model}.py -i {input} -o {output}")