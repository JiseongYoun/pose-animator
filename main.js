
document.addEventListener("DOMContentLoaded", function() {
	document.body.addEventListener("mousemove", evt => {
		const mouseX = evt.screenX - 100; 
		const mouseY = evt.screenY - 300;
		console.log(evt.screenX, evt.screenY)
		gsap.set(".cursor", {
		  x: mouseX,
		  y: mouseY
		})
		gsap.to(".shape", {
		  x: mouseX,
		  y: mouseY,
		  stagger: -0.1
		})
	  })
});