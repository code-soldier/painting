#version 300 es
#define attribute in
#define textureCube texture
#define texture2D texture
#define textureCubeLod textureLod
#define texture2DLod textureLod


#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
precision highp int;
#else
precision mediump float;
precision mediump int;
#endif

/*=========================================================================

  Program:   Visualization Toolkit
  Module:    vtkPolyDataVS.glsl

  Copyright (c) Ken Martin, Will Schroeder, Bill Lorensen
  All rights reserved.
  See Copyright.txt or http://www.kitware.com/Copyright.htm for details.

     This software is distributed WITHOUT ANY WARRANTY; without even
     the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
     PURPOSE.  See the above copyright notice for more information.

=========================================================================*/

attribute vec4 vertexMC;

// frag position in VC
out vec4 vertexVCVSOutput;
uniform float pointSize;

// optional normal declaration
//VTK::Normal::Dec

// extra lighting parameters
//VTK::Light::Dec

// Texture coordinates
attribute vec2 tcoordMC; out vec2 tcoordVCVSOutput;

// material property values
//VTK::Color::Dec

// clipping plane vars
//VTK::Clip::Dec

// camera and actor matrix values
uniform mat4 MCPCMatrix;
uniform mat4 MCVCMatrix;

// Apple Bug
//VTK::PrimID::Dec

// picking support
//VTK::Picking::Dec

void main()
{
  //VTK::Color::Impl

  //VTK::Normal::Impl

  tcoordVCVSOutput = tcoordMC;

  //VTK::Clip::Impl

  //VTK::PrimID::Impl

  vertexVCVSOutput = MCVCMatrix * vertexMC;
  gl_Position = MCPCMatrix * vertexMC;
  gl_PointSize = pointSize;

  //VTK::Light::Impl

  //VTK::Picking::Impl
}