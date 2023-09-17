#version 300 es

in vec3 position;
in vec3 color;
// in vec3 normal;
// in vec2 uv;

out vec3 fragColor;
// out vec3 fragNormal;
// out vec2 fragUV;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);

    fragColor = color;
    // fragNormal = (modelViewMatrix * vec4(normal, 0.0)).xyz;

}

// //VTK::System::Dec

// attribute vec4 vertexMC;

// // frag position in VC
// //VTK::PositionVC::Dec

// // optional normal declaration
// //VTK::Normal::Dec

// // extra lighting parameters
// //VTK::Light::Dec

// // Texture coordinates
// //VTK::TCoord::Dec

// // material property values
// //VTK::Color::Dec

// // clipping plane vars
// //VTK::Clip::Dec

// // camera and actor matrix values
// //VTK::Camera::Dec

// // Apple Bug
// //VTK::PrimID::Dec

// // picking support
// //VTK::Picking::Dec

// void main()
// {
//   //VTK::Color::Impl

//   //VTK::Normal::Impl

//   //VTK::TCoord::Impl

//   //VTK::Clip::Impl

//   //VTK::PrimID::Impl

//   //VTK::PositionVC::Impl

//   //VTK::Light::Impl

//   //VTK::Picking::Impl
// }