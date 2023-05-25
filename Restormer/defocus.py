import os
import shutil
import argparse

argParser = argparse.ArgumentParser()
argParser.add_argument("-i", "--input-dir", required=True,type=str, help="Directory in which input files are placed")
argParser.add_argument("-o", "--output-dir",required=True, type=str,help="Directory in which output files should be placed")
argParser.add_argument("-f", "--output-file-name", required=True,type=str,help="Output File Name")

args = argParser.parse_args()

input_dir = args.input_dir
out_dir = args.output_dir
output_file_name= args.output_file_name


# // 2
import torch
import torch.nn.functional as F
import torchvision.transforms.functional as TF
from runpy import run_path
from skimage import img_as_ubyte
from natsort import natsorted
from glob import glob
import cv2
from tqdm import tqdm
import numpy as np



# Get model weights and parameters
weights = os.path.join('Defocus_Deblurring', 'pretrained_models', 'single_image_defocus_deblurring.pth')
parameters = {'inp_channels':3, 'out_channels':3, 'dim':48, 'num_blocks':[4,6,6,8], 'num_refinement_blocks':4, 'heads':[1,2,4,8], 'ffn_expansion_factor':2.66, 'bias':False, 'LayerNorm_type':'WithBias', 'dual_pixel_task':False}


load_arch = run_path(os.path.join('basicsr', 'models', 'archs', 'restormer_arch.py'))
model = load_arch['Restormer'](**parameters)


checkpoint = torch.load(weights)
model.load_state_dict(checkpoint['params'])



# // 3 Inference

files = natsorted(glob(os.path.join(input_dir, '*')))

img_multiple_of = 8

print(f"\n ==> Running defocus_model with weights {weights}\n ")
with torch.no_grad():
  for filepath in tqdm(files):
      
      img = cv2.cvtColor(cv2.imread(filepath), cv2.COLOR_BGR2RGB)
      input_ = torch.from_numpy(img).float().div(255.).permute(2,0,1).unsqueeze(0)
      
      h,w = input_.shape[2], input_.shape[3]
      H,W = ((h+img_multiple_of)//img_multiple_of)*img_multiple_of, ((w+img_multiple_of)//img_multiple_of)*img_multiple_of
      padh = H-h if h%img_multiple_of!=0 else 0
      padw = W-w if w%img_multiple_of!=0 else 0
      input_ = F.pad(input_, (0,padw,0,padh), 'reflect')

      restored = model(input_)
      restored = torch.clamp(restored, 0, 1)

      # Unpad the output
      restored = restored[:,:,:h,:w]

      restored = restored.permute(0, 2, 3, 1).cpu().detach().numpy()
      restored = img_as_ubyte(restored[0])

      cv2.imwrite(os.path.join(out_dir, output_file_name),cv2.cvtColor(restored, cv2.COLOR_RGB2BGR))
