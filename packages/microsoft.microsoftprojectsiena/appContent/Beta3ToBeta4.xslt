<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:msxsl="urn:schemas-microsoft-com:xslt"
                xmlns:wadl="http://wadl.dev.java.net/2009/02"
                xmlns:sienasrc="http://schemas.microsoft.com/MicrosoftProjectSiena/v1/WADL"
                xmlns:siena="http://schemas.microsoft.com/MicrosoftProjectSiena/WADL/2014/11"
                exclude-result-prefixes="msxsl sienasrc"
                >
  <xsl:output method="xml" indent="yes" encoding="utf-8" />

  <xsl:template match="/">
    <xsl:apply-templates select="/wadl:application"/>
  </xsl:template>

  <!--
  Explicitly override any elements which have been changed in the new version and document the change and intended
  transformation.
  
  Change Notes:
  - The siena:header element has been removed and certain attributes moved up onto the wadl:application element.
  - Added siena:doc elements (in place of wadl:doc elements) when the docs are for siena extension elements.
  - Removed doc elements from siena extension elements that do not need them. The preferred thing to do is to add a comment instead.
  -->
  <xsl:template match="wadl:application">
    <xsl:copy>
      <xsl:attribute name="siena:serviceId">
        <xsl:value-of select="sienasrc:header/@serviceId"/>
      </xsl:attribute>
      <xsl:attribute name="siena:author">
        <xsl:value-of select="sienasrc:header/@author"/>
      </xsl:attribute>
      <xsl:apply-templates select="*[not(self::sienasrc:header)]"/>
    </xsl:copy>
  </xsl:template>

  <!-- Remove the auth method for Client Credentials. -->
  <xsl:template match="wadl:method[@sienasrc:isAuth='true']"/>

  <!-- Remove isAuth attribute from methods as it's no longer used. -->
  <xsl:template match="wadl:method/@sienasrc:isAuth"/>

  <!-- Client Credentials grant type -->
  <xsl:template match="sienasrc:clientCredentials">
    <xsl:variable name="clientMethodRef" select="substring(@clientMethodRef, 2)" />
    <xsl:variable name="clientMethod" select="/wadl:application/wadl:resources//wadl:method[@id=$clientMethodRef]"/>
    <xsl:element name="{name()}" namespace="http://schemas.microsoft.com/MicrosoftProjectSiena/WADL/2014/11">
      <xsl:attribute name="scope">
        <xsl:value-of select="$clientMethod/wadl:request/wadl:representation/wadl:param[@name='scope']/@fixed"/>
      </xsl:attribute>
      <xsl:element name="siena:endpoints">
        <xsl:element name="siena:token">
          <xsl:attribute name="url">
            <!-- 
            Note that this assumes there are only two levels (resources and resource) for the authentication
            method. Conversion of Wadl files with an auth method with more levels is not supported currently.
            -->
            <xsl:variable name="resourcesBase" select="/wadl:application/wadl:resources/@base" />
            <xsl:variable name="resourcePath" select="/wadl:application/wadl:resources/wadl:resource/@path" />
            <xsl:choose>
              <xsl:when test="substring($resourcesBase, string-length($resourcesBase)) = '/'">
                <xsl:value-of select="concat($resourcesBase, $resourcePath)"/>
              </xsl:when>
              <xsl:otherwise>
                <!-- Add '/' to the base if base does not end with one. -->
                <xsl:variable name="resourcesBaseWithSlash" select="concat($resourcesBase, '/')" />
                <xsl:value-of select="concat($resourcesBaseWithSlash, $resourcePath)"/>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:attribute>
        </xsl:element>
      </xsl:element>
      <xsl:element name="siena:credentials" >
        <xsl:attribute name="clientId">
          <xsl:variable name="ClientIdMethodParam" select="$clientMethod/wadl:request/wadl:representation/wadl:param[@name='client_id']" />
          <xsl:value-of select="$ClientIdMethodParam/@fixed"/>
        </xsl:attribute>
        <xsl:attribute name="clientSecret">
          <xsl:variable name="ClientSecretMethodParam" select="$clientMethod/wadl:request/wadl:representation/wadl:param[@name='client_secret']" />
          <xsl:value-of select="$ClientSecretMethodParam/@fixed"/>
        </xsl:attribute>
      </xsl:element>
    </xsl:element>
  </xsl:template>

  <!-- implicit grant type. Move the scope attribute from parent to child. -->
  <xsl:template match="sienasrc:implicit" >
    <xsl:element name="{name()}" namespace="http://schemas.microsoft.com/MicrosoftProjectSiena/WADL/2014/11">
      <xsl:copy-of select="../@scope"/>
      <xsl:apply-templates select="@* | node()"/>
    </xsl:element>
  </xsl:template>
  <xsl:template match="sienasrc:grantType/@scope"/>

  <!-- Modify the template params for client_secrent and client_id. -->
  <xsl:template match="sienasrc:template/sienasrc:variable/sienasrc:modifyParams[@name='client_secret']">
    <xsl:element name="siena:modifyAuth" namespace="http://schemas.microsoft.com/MicrosoftProjectSiena/WADL/2014/11">
      <xsl:attribute name="href">
        <!-- 
        Note that this assumes there is only one auth2 provider in the Wadl. Conversion for files with
        multiple oauth2 providers is not supported currently.
        -->
        <xsl:value-of select="concat('#', /wadl:application/sienasrc:authenticationProviders/sienasrc:oauth2/@id)"/>
      </xsl:attribute>
      <xsl:attribute name="tag">
        <xsl:text>credentials</xsl:text>
      </xsl:attribute>
      <xsl:attribute name="attribute">
        <xsl:text>clientSecret</xsl:text>
      </xsl:attribute>
    </xsl:element>
  </xsl:template>
  <xsl:template match="sienasrc:template/sienasrc:variable/sienasrc:modifyParams[@name='client_id']">
    <xsl:element name="siena:modifyAuth" namespace="http://schemas.microsoft.com/MicrosoftProjectSiena/WADL/2014/11">
      <xsl:attribute name="href">
        <!-- 
        Note that this assumes there is only one auth2 provider in the Wadl. Conversion for files with
        multiple oauth2 providers is not supported currently.
        -->
        <xsl:value-of select="concat('#', /wadl:application/sienasrc:authenticationProviders/sienasrc:oauth2/@id)"/>
      </xsl:attribute>
      <xsl:attribute name="tag">
        <xsl:text>credentials</xsl:text>
      </xsl:attribute>
      <xsl:attribute name="attribute">
        <xsl:text>clientId</xsl:text>
      </xsl:attribute>
    </xsl:element>
  </xsl:template>

  <!-- Handle doc element changes -->
  <xsl:template match="wadl:doc" mode="wadlDocToComment">
    <xsl:if test="@title and (not(@xml:lang) or @xml:lang = 'en-us')">
      <xsl:comment>
        <xsl:value-of select="@title"/>
      </xsl:comment>
    </xsl:if>
  </xsl:template>
  <xsl:template match="wadl:doc" mode="wadlDocToSienaDoc">
    <xsl:element name="siena:doc">
      <xsl:if test="@sienasrc:displayName">
        <xsl:attribute name="displayName">
          <xsl:value-of select="@sienasrc:displayName"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:if test="@title">
        <xsl:attribute name="title">
          <xsl:value-of select="@title"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:if test="@xml:lang">
        <xsl:attribute name="xml:lang">
          <xsl:value-of select="@xml:lang"/>
        </xsl:attribute>
      </xsl:if>
    </xsl:element>
  </xsl:template>
  <xsl:template match="sienasrc:variable/wadl:doc">
    <xsl:apply-templates select="." mode="wadlDocToSienaDoc"/>
  </xsl:template>
  <xsl:template match="sienasrc:languageVariable/wadl:doc">
    <xsl:apply-templates select="." mode="wadlDocToSienaDoc"/>
  </xsl:template>
  <xsl:template match="sienasrc:*//wadl:doc">
    <!-- Remove doc elements from all other siena extension elements as they nolonger support them. -->
    <xsl:apply-templates select="." mode="wadlDocToComment"/>
  </xsl:template>
  <!-- All other doc elements, we need to make sure we remove the siena:displayName unless its supported by the containing element.
  This is because the Beta3 parser was not dis-allowing the siena:displayName on doc elements anywhere, but the Beta4 parser now does.
  TODO: ...
  -->
  <xsl:template match="wadl:method/wadl:doc">
    <!-- Wadl method elements are the only WADL elements that support the siena:displayName attribute in Beta3. -->
    <xsl:copy>
      <xsl:apply-templates select="@* | node()"/>
    </xsl:copy>
  </xsl:template>
  <xsl:template match="wadl:doc">
    <xsl:copy>
      <!-- Remove the siena:displayName attribute as the parser in Beta3 didn't disallow it, and Beta3 disallows it. -->
      <xsl:if test="@title">
        <xsl:attribute name="title">
          <xsl:value-of select="@title"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:if test="@xml:lang">
        <xsl:attribute name="xml:lang">
          <xsl:value-of select="@xml:lang"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:copy-of select="node()"/>
    </xsl:copy>
  </xsl:template>

  <!--
  The following are the catch-all for any of the elements in the namespaces we care about.
  They do a basic copy of the element and apply templates to any of its children.
  -->

  <xsl:template match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()"/>
    </xsl:copy>
  </xsl:template>

  <xsl:template match="wadl:*">
    <xsl:element name="{name()}" namespace="http://wadl.dev.java.net/2009/02">
      <xsl:apply-templates select="node()|@*"/>
    </xsl:element>
  </xsl:template>

  <xsl:template match="sienasrc:*">
    <xsl:element name="{name()}" namespace="http://schemas.microsoft.com/MicrosoftProjectSiena/WADL/2014/11">
      <xsl:apply-templates select="node()|@*"/>
    </xsl:element>
  </xsl:template>

  <xsl:template match="@sienasrc:*">
    <xsl:attribute name="{local-name()}" namespace="http://schemas.microsoft.com/MicrosoftProjectSiena/WADL/2014/11">
      <xsl:value-of select="."/>
    </xsl:attribute>
  </xsl:template>

</xsl:stylesheet>
