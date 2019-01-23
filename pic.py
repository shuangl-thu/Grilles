import json
from scipy import interpolate
import pylab as pl
with open("./simple.ndjson") as f: 
    cnt = 0
    for line in f:
        cnt+=1
        if cnt > 15:
            break
        setting = json.loads(line)
        print(setting)
        for i in range(0,len(setting['drawing'])):
            x = setting['drawing'][i][0]
            y = setting['drawing'][i][1]
            f=interpolate.interp1d(x,y,kind="slinear")
            pl.plot(x,y,'k')
        ax = pl.gca()
        ax.xaxis.set_ticks_position('top')  
        ax.invert_yaxis()
        pl.axis('off')
        pl.savefig("./cat/%d.png"%cnt)
        pl.close()
