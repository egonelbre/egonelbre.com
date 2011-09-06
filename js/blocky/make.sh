#!/bin/bash

#cat script.js | sed 's/world\={}/world\=\[\],WP,WJ/g' | 
#                sed 's/world\.key/world[1]/g' | 
#                sed 's/world\.size/world[0]/g' | 
#                sed 's/world\.blocks/world[2]/g' |
#                sed 's/world\.player/world[3]/g' |
#                sed 's/world\.jump/world[4]/g' |                                
#                sed 's/0\././g' > temp.js

if [ $1 ]; then
  echo "only second stage"
else
 
cat script.js | sed 's/world\={}/WK,WS,WB,WP,WJ/g' | 
                sed 's/sx/I/g' |
                sed 's/sy/t/g' |
                sed 's/world\.key/WK/g' | 
                sed 's/world\.size/WS/g' | 
                sed 's/world\.blocks/WB/g' |
                sed 's/world\.player/WP/g' |
                sed 's/world\.jump/WJ/g' |
                sed 's/0\././g' > temp.js

cat temp.js | java -jar compiler.jar --formatting PRETTY_PRINT --compilation_level ADVANCED_OPTIMIZATIONS > temp2.js

cat temp2.js | sed 's/function \([a-z]\)(/\1=function(/g' | 
               sed 's/0\././g' |
               sed 's/console\.log();//g' | 
               sed 's/function()/function(b)/g' |
               sed 's/var//g' > optimized.js

fi

cat optimized.js | java -jar compiler.jar --compilation_level WHITESPACE_ONLY > temp3.js
cat temp3.js | 
    sed 's/0\././g' | 
    sed 's/{b;/{/g' |
    sed 's/;I/,I/g' |
    sed 's/;t/,t/g' |
    sed 's/512/w/g' |
    sed 's/height=w/height=w=512/' |
    sed 's/^\([a-z]\)=1\(,[a-z]\)\+/\1=1/' |
    sed -n -e ':a' -e "$ s/\n//gp;N;b a" > optimized-nw.js

wc -c optimized-nw.js

#less optimized.js

# WHITESPACE_ONLY
# SIMPLE_OPTIMIZATIONS
# ADVANCED_OPTIMIZATIONS          

