void mainImage( out vec4 fragColor, in vec2 fragCoord )
{

	vec2 p = (2.*fragCoord.xy-iResolution.xy) / iResolution.y; 

    float a = atan(p.x,p.y);
    float r = length(p);
    vec2 uv = vec2(0.0,r);

	uv = (2.0 * uv) -1.0;     
    float beamWidth = abs(5.0 / (40.0 * uv.y));

    
    
    

    if(abs(uv.y)>=1.0)
    {
    
   	  // fragColor=vec4(0.0,0.5,0.0,1.0);
      //  return;
    }
    
	vec3 horBeam = vec3(beamWidth);
	
	//fragColor = vec4( horBeam , 1.0);
    fragColor = vec4( 5. / (40. * abs(2.*length(p)-1.) ) );

    
  
}