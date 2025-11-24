The idea is to write a showNumber function for displaying numbers to normal 
people that doesn't resort to scientific notation (e.g., show "2M" or 
"2 million" instead of "1e6") and is easily portable between Javascript, Ruby, 
and Python.

Also it should have a parameter for the conservative direction -- down (-1) or 
up (+1) -- to round. So if the number is 3.001 that rounds to "3" unless we need
to err on the high side, in which case it would round to "3.1" or "4" or 
whatever, depending on desired precision.

Changelog:

2023-11-20: cleanup of the tidyround() function  
2019-11-23: bugfix  
2019-06-21: switch to all client-side code  
2017-01-20: spec'd and stubbed  
2017-01-15: dreeves initializes project based on regex checker  


https://beeminder.uservoice.com/forums/3011-general/suggestions/16555894-fix-rounding-bugs-with-amounts-less-than-0-01

## Original Mathematica implementation of something similar

Show Number. Convert x to string w/ no trailing dot. Target a total of sf
significant figures, clipped to be at least i and at most i+d, where i is 
the number of digits in the integer part of x (and d defaults to 
Ceiling[sf/2]). 
Ie, don't show fewer sigfigs than digits left of the decimal point (like 
not showing 1234 as 1200) and don't show more than d after the decimal 
point.
Eg, 123.45 to 1 or 2 sigfigs is the same as 3 sigfigs (123) since there 
are 3 digits left of the decimal point. And 9.1234 to 4 sigfigs [1,1+2].
Can also specify explicit prefix strings for negative and positive 
numbers, typically for when you want an explicit plus sign in front 
positive numbers, like for specifying a delta.

```
Off[NumberForm::"sigz"]; (* o.w. ~10^100 in nonscientific notation complains *)
shn[x_, sf_:10, d_:Null, s_:{"-",""}] := If[!NumericQ[x], cat[x],
  With[{i= IntegerLength@IntegerPart@x, dp = If[d===Null, Ceiling[sf/2], d]},
    StringReplace[ToString@NumberForm[N@x, Clip[sf, {i,i+dp}],
                                     ExponentFunction->(Null&), NumberSigns->s],
                  re@"\\.$"->""]]]
```
