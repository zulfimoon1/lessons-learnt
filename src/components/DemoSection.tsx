
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayCircleIcon } from "lucide-react";

const DemoSection = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-4">See It In Action</h2>
        <p className="text-xl text-muted-foreground">Watch how Lesson Lens transforms classroom feedback</p>
      </div>
      
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircleIcon className="w-6 h-6" />
            Product Demo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <PlayCircleIcon className="w-16 h-16 text-primary mx-auto mb-4" />
              <p className="text-lg font-semibold">Interactive Demo</p>
              <p className="text-muted-foreground">Experience the full platform workflow</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default DemoSection;
