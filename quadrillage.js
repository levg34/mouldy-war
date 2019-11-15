var a = 1
var L = 10

function Point(x,y) {
	console.log({x,y})
}

for (var n=1; n<L; n++) {
	for (var m=1;2*a*n-m>0;m++) {
		Point(m,2*a*n-m)
	}
}
