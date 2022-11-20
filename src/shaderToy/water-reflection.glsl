#define M_PI (3.14152965359)
#iChannel0 "file://cat.jpg"

float softSign(in float vi)
{
    return atan(pow(vi,3.0));
}
vec3 gradSunset(float dist, float conf)
{
    // [0, 1]
    float dd = 1.0-dist;
    
    float redConf =  1.0 + 0.5 * conf;
    float yelConf =  2.5 + 3.0 * conf;
    float purConf =  5.0 + 1.0 * conf;
    
    return vec3(
        0.5 + 0.5*pow(dd, redConf),     // Gotta be a little bit red everywhere
        (1.0 - conf) * 0.9*pow(dd, yelConf),
        12.0*pow(dd, redConf)*pow(dist, purConf)
        );
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Parameters
	float colorConf = 0.0;					// 0 = a nice sunset effect, 1 = a scary red effect
	float waterDensity = 1.0;				// 0 = no reflection effect, 1 = full opacity reflection
	float colorDensity = 0.0;				// 0 = no additional color, 1 = full additional colorizing
      
    float cutoff = 0.22;					// Y-coordinate where the backdrop ends and water begins 
    float decay = 3.0;                      // Strength of horizontal wave out from center (multiplied by 4 in equation)
    float decayCenter = 0.5;                // Center of horizontal wave
    float grandCurrentV = -1.0;             // Period of large water cycle toward user
    float grandCurrentH = 12.0;             // Period of large water cycle horizontally back and forth
    vec2 waveCurrent = vec2(grandCurrentH, grandCurrentV);
    vec2 waveCount = vec2(7.0, 7.0);        // Number of "waves" (texture transfer oscillations) - horiz, toward
    vec2 waveStrength = vec2(0.1, 0.5);     // Strength of waves - horiz, toward
    float slightXCutoff = 0.02;				// Soften the cutoff by blending up waves
    
    
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord / iResolution.xy;

	// Position of "sun" in sunset coloration
    vec2 sun = vec2(0.5, cutoff);
    
    // Start with a mapping of the backdrop image into the area used for reflection
    float yWater = 1.0 - uv.y/cutoff;
    float yScale = (cutoff-1.0);
    
    
    // 
    vec2 pq = uv;
    pq.y = yWater*(2.0-yWater);

    // cross section horizontally = e^(-decay*x^2)*cos(2*pi*x/WH)
    // cross section toward = sin(2*pi*y/WV)
    vec2 uvWaterBase;
    float xDecay = exp(-decay*(pq.x-decayCenter)*(pq.x-decayCenter));
    float xWaver = sin(2.0*M_PI*(waveCount.x*pq.x + iTime/grandCurrentH));
    float yDecay = 1.0 - exp(-decay*pq.y);
    float yWaver = sin(2.0*M_PI*(waveCount.y*pq.y + iTime/grandCurrentV));
    float xPushy = 0.5*xDecay*(xWaver+yWaver);
    uvWaterBase.x = waveStrength.x*xPushy*pq.y + pq.x;
    uvWaterBase.y = (waveStrength.y*(0.5*yDecay*yWaver + 0.5) + pq.y)/(1.0 + waveStrength.y);


    // Keep pq from overflowing around the image when it shouldn't.
    pq = clamp(uvWaterBase, 0.01, 0.99);

    // Shift y back to just water zone
    pq.y = cutoff - pq.y*yScale;
    
    vec2 uvFinal = uv;
   
    // Water here or not?
    float waterWeight = 0.0;
    if (uv.y - cutoff + slightXCutoff*xPushy < 0.0)
    {
        waterWeight = 1.0;
    }
    uvFinal = pq*waterWeight + uv*(1.0-waterWeight);

    // Blend the original texture and the water reflection remap into the same texture and blend.
    vec4 texAir = texture(iChannel0, uv);
    vec4 texWater = texture(iChannel0, pq);
    float waterHere = waterWeight;
    vec4 tex = texAir*(1.0 - waterHere*waterDensity) + texWater*waterHere*waterDensity;


    // Map color overlay to image using a radial gradient
    float xx, yy, c1, c2;
    xx = uv.x - sun.x;
    yy = uv.y - sun.y;
    c1 = sqrt(xx*xx + yy*yy);
    vec3 gradColorAir   = gradSunset(c1, colorConf);
    xx = pq.x - sun.x;
    yy = pq.y - sun.y;
    c2 = sqrt(clamp(xx*xx + yy*yy, 0.0, 1.0));
    vec3 gradColorWater = gradSunset(c2, colorConf);
    vec3 gradColor = gradColorAir*(1.0 - waterHere*waterDensity) + gradColorWater*waterHere*waterDensity;


    gradColor = vec3(1.0, 1.0, 1.0)*(1.0 - colorDensity) + gradColor*colorDensity;
    

    // Output to screen
    fragColor = vec4(tex.rgb * gradColor, 1.0);
}