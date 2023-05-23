import os
import argparse

argParser = argparse.ArgumentParser()
argParser.add_argument("-m", "--model-name", required=True,type=str, help="Directory in which input files are placed")
argParser.add_argument("-i", "--input-dir", required=True,type=str, help="Directory in which input files are placed")
argParser.add_argument("-o", "--output-dir", required=True,type=str,help="Directory in which output files should be placed")

args = argParser.parse_args()

cwd = os.getcwd()
os.path.join(cwd,args.input_dir)
model = f"""{os.path.join("Restormer",args.model_name)}"""
input = f"{os.path.join(cwd,args.input_dir)}"
output= f"{os.path.join(cwd,args.output_dir)}"

os.makedirs(output, exist_ok=True)

os.system(f"python3 {model}.py -i '{input}' -o '{output}'")
# print(f"python3 {model}.py -i {input} -o {output}")