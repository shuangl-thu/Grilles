from PIL import Image, ImageEnhance
from pylab import *
#import numpy as np
from scipy.ndimage import filters
#from skimage import io
import glob, os

in_dir = './red_clean'
out_dir = in_dir + 'Dog53'
if not os.path.exists(out_dir): os.mkdir(out_dir)

for files1 in glob.glob(in_dir + '/*'):
    filepath, filename = os.path.split(files1)

    Gamma = 0.99
    Phi = 200
    Epsilon = 0.1
    k = 5
    Sigma = 3

    im = Image.open(files1).convert('L')
    im = array(ImageEnhance.Sharpness(im).enhance(3.0))
    im2 = filters.gaussian_filter(im, Sigma)
    im3 = filters.gaussian_filter(im, Sigma* k)
    differencedIm2 = im2 - (Gamma * im3)
    (x, y) = shape(im2)
    for i in range(x):
        for j in range(y):
            if differencedIm2[i, j] < Epsilon:
                differencedIm2[i, j] = 1
            else:
                differencedIm2[i, j] = 250 + tanh(Phi * (differencedIm2[i, j]))


    gray_pic=differencedIm2.astype(np.uint8)
    final_img = Image.fromarray( gray_pic)
    final_img.save(os.path.join(out_dir, filename),quality = 100)