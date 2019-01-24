import numpy as np
import scipy.ndimage as ndi
from skimage import morphology
from PIL import Image,ImageFilter,ImageEnhance,ImageOps
import matplotlib.pyplot as plt
import pylab as pl
from pylab import *
import os,glob

inputdir = "./red_cleanDog53"
outdir = "./red_cleanDog53_clean"
suffix = "*.jpg"

def isnotwhite(pix):
    return not (pix[0]==255 and pix[1]==255 and pix[2]==255) 

for imgpath in glob.glob(os.path.join(inputdir,suffix)):
    filepath, filename = os.path.split(imgpath)

    img = Image.open(imgpath)
    img = img.convert("1")
    img = img.point(lambda x: 1 if x==0 else 0)
    data = np.asarray(img)

    dst=morphology.remove_small_objects(data,min_size=100,connectivity=2)
    fig,ax = plt.subplots()

    fig.tight_layout()

    dst=((1-dst)*255).astype('int32')

    img = Image.fromarray(dst)
    img = img.convert('RGB')
    print(np.asarray(img))
    # if red
    #x, y, _= shape(img)
    #for i in range(x):
    #    for j in range(y):
    #        img.getpixel((i,j))
    #        if isnotwhite(img.getpixel((i,j))):
    #            img.putpixel((i,j),(255,33,33)) 
    #        else:
    #            img.putpixel((i,j),(255,255,255))
    # img.show()
    img.save(os.path.join(outdir,filename),quality = 100)