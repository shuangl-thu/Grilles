from PIL import Image
from pylab import *
#import numpy as np
#from skimage import io
import glob, os

in_dir = 'clean_1'
out_dir = in_dir + '_red'
if not os.path.exists(out_dir): os.mkdir(out_dir)

thresh = 70

def isred(pix):
    return pix[0]-pix[1] >= thresh and pix[0]-pix[1] >= thresh

def main():

    # files1 = "testin.jpg"
    # im = Image.open(files1).convert('RGB')
    # x, y, _= shape(im)
    # for i in range(x):
    #     for j in range(y):
    #         # im.getpixel((i,j)))
    #         if isred(im.getpixel((i,j))):
    #             im.putpixel((i,j),(255,33,33)) 
    #         else:
    #             im.putpixel((i,j),(255,255,255))
    # im.save('test.jpg')

    for files1 in glob.glob(in_dir + '/*.jpg'):
        filepath, filename = os.path.split(files1)

        im = Image.open(files1).convert('RGB')
        x, y, _= shape(im)
        for i in range(x):
            for j in range(y):
                # im.getpixel((i,j)))
                if isred(im.getpixel((i,j))):
                    im.putpixel((i,j),(255,33,33)) 
                else:
                    im.putpixel((i,j),(255,255,255))

        im.save(os.path.join(out_dir, filename))

if __name__ == '__main__':
    main()
